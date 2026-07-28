import { NextResponse } from "next/server";
import { getUserIdFromRequest, AuthError } from "@/lib/auth-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  let userId: string;
  try {
    userId = getUserIdFromRequest(req);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ detail: e.message }, { status: 401 });
    }
    throw e;
  }

  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("resumes")
    .select("id, file_name, is_active, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
