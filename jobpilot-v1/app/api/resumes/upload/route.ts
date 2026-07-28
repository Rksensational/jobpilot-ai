import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getUserIdFromRequest, AuthError } from "@/lib/auth-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { extractText, UnsupportedFileTypeError } from "@/lib/text-extraction";
import { parseResumeWithGemini, GeminiError } from "@/lib/gemini";

export const runtime = "nodejs"; // pdf-parse/mammoth need Node, not Edge
export const maxDuration = 60; // Gemini call can take a few seconds

const MAX_SIZE_MB = 10;

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await getUserIdFromRequest(req);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ detail: e.message }, { status: 401 });
    }
    throw e;
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ detail: "No file provided." }, { status: 400 });
  }

  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > MAX_SIZE_MB) {
    return NextResponse.json(
      { detail: `File too large (${sizeMb.toFixed(1)}MB). Max is ${MAX_SIZE_MB}MB.` },
      { status: 413 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const warnings: string[] = [];
  const db = createSupabaseAdminClient();

  try {
    // 1. Extract raw text
    const { text: rawText, fileType } = await extractText(buffer, file.name);
    if (!rawText || rawText.length < 50) {
      warnings.push(
        "Very little text was extracted — the file may be a scanned image rather than a text-based PDF/DOCX."
      );
    }

    // 2. AI structured extraction
    const parsed = await parseResumeWithGemini(rawText);

    // 3. Upload original file to Supabase Storage
    const storagePath = `${userId}/${randomUUID()}_${file.name}`;
    const { error: uploadError } = await db.storage
      .from("resumes")
      .upload(storagePath, buffer, {
        contentType:
          fileType === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // 4. Deactivate previous resumes, insert new active one
    await db.from("resumes").update({ is_active: false }).eq("user_id", userId);

    const { data: inserted, error: insertError } = await db
      .from("resumes")
      .insert({
        user_id: userId,
        file_name: file.name,
        file_path: storagePath,
        file_type: fileType,
        raw_text: rawText,
        parsed_json: parsed,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`);
    }

    // 5. Normalize skills (best-effort; failures here shouldn't fail the request)
    await syncSkills(db, inserted.id, parsed.skills);

    return NextResponse.json({
      resume_id: inserted.id,
      file_name: file.name,
      parsed,
      warnings,
    });
  } catch (e) {
    if (e instanceof UnsupportedFileTypeError) {
      return NextResponse.json({ detail: e.message }, { status: 400 });
    }
    if (e instanceof GeminiError) {
      return NextResponse.json({ detail: e.message }, { status: 502 });
    }
    console.error("Resume upload failed:", e);
    return NextResponse.json(
      { detail: "Failed to process resume. Please try again." },
      { status: 500 }
    );
  }
}

async function syncSkills(
  db: ReturnType<typeof createSupabaseAdminClient>,
  resumeId: string,
  skills: string[]
) {
  for (const raw of skills) {
    const name = raw.trim();
    if (!name) continue;

    const { data: existing } = await db.from("skills").select("id").eq("name", name).maybeSingle();
    let skillId = existing?.id;

    if (!skillId) {
      const { data: created, error } = await db
        .from("skills")
        .insert({ name })
        .select("id")
        .single();
      if (error || !created) continue; // best-effort, skip on failure
      skillId = created.id;
    }

    await db.from("resume_skills").upsert({ resume_id: resumeId, skill_id: skillId });
  }
}
