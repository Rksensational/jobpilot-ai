/**
 * Calls the Gemini API directly via REST (no SDK needed — keeps the
 * dependency list small and avoids SDK version churn). Uses the free-tier
 * `gemini-2.0-flash` model.
 *
 * Get a free API key at: https://aistudio.google.com/apikey
 */

export interface ParsedResume {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  skills: string[];
  job_titles: string[];
  industries: string[];
  experience: {
    title: string;
    company: string;
    location: string | null;
    start_date: string | null;
    end_date: string | null;
    description: string | null;
  }[];
  education: {
    degree: string;
    institution: string;
    field_of_study: string | null;
    start_year: string | null;
    end_year: string | null;
  }[];
  certifications: { name: string; issuer: string | null; year: string | null }[];
  total_experience_years: number | null;
}

const RESUME_PROMPT = (resumeText: string) => `You are a resume parsing engine. Extract structured information \
from the resume text below and return ONLY valid JSON matching this exact schema \
(no markdown fences, no commentary, no extra keys):

{
  "name": string or null,
  "email": string or null,
  "phone": string or null,
  "location": string or null,
  "summary": string or null (a 2-3 sentence professional summary you write based on the resume),
  "skills": array of strings (deduplicated, normalized),
  "job_titles": array of strings,
  "industries": array of strings,
  "experience": array of {
     "title": string, "company": string, "location": string or null,
     "start_date": string or null, "end_date": string or null (use "Present" if current),
     "description": string or null
  },
  "education": array of {
     "degree": string, "institution": string, "field_of_study": string or null,
     "start_year": string or null, "end_year": string or null
  },
  "certifications": array of { "name": string, "issuer": string or null, "year": string or null },
  "total_experience_years": number or null (estimate from experience dates)
}

Resume text:
---
${resumeText.slice(0, 30000)}
---

Return ONLY the JSON object, nothing else.`;

export class GeminiError extends Error {}

export async function parseResumeWithGemini(resumeText: string): Promise<ParsedResume> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiError("GEMINI_API_KEY is not configured.");

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: RESUME_PROMPT(resumeText) }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new GeminiError(`Gemini API error (${res.status}): ${errBody.slice(0, 300)}`);
  }

  const data = await res.json();
  const rawText: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new GeminiError("Gemini returned no content.");
  }

  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  }

  try {
    return JSON.parse(cleaned) as ParsedResume;
  } catch (e) {
    throw new GeminiError(`Gemini returned invalid JSON: ${(e as Error).message}`);
  }
}
