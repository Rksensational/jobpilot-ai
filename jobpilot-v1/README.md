# JobPilot AI — Level 1 (Resume Analyzer)

A single Next.js 15 app — frontend + backend combined via API routes — so
it deploys to Vercel as **one project**, no separate backend host needed.

**Stack (100% free tier):**
- **Vercel** — hosting (Hobby plan, free)
- **Supabase** — Postgres DB + Auth + Storage (free tier)
- **Gemini API** — resume parsing AI (free tier key)

Verified: real `npm run build` passes (TypeScript strict, all routes
compiled), and the API auth guard was tested live (`npm run dev`,
confirmed 401 on unauthenticated upload).

---

## What's included in Level 1

- Email/password auth (Supabase Auth)
- Resume upload (PDF or DOCX)
- Server-side text extraction (`pdf-parse`, `mammoth`)
- AI structured extraction via Gemini (name, email, skills, experience,
  education, certifications, estimated years of experience)
- Results persisted to Supabase (Postgres + Storage), scoped per-user via
  Row Level Security
- Clean dark-mode UI

Not yet built (coming in later levels): job search, company search, AI
matching, cover letters, application tracker, recruiter discovery, Gmail
outreach. Each will be added the same way — real code, tested before
handoff.

---

## Step-by-step deploy

### 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Once created, go to **SQL Editor** → paste the entire contents of
   `supabase/schema.sql` → **Run**.
   - This creates the `resumes`, `skills`, `resume_skills` tables, RLS
     policies, and the `resumes` Storage bucket.
   - If the storage bucket policy statements at the bottom error out
     (some Supabase plans restrict direct `storage.objects` policy
     creation via SQL), instead go to **Storage → New bucket**, name it
     `resumes`, keep it **private**, and skip those two statements.
3. Go to **Project Settings → API** and copy:
   - `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (click reveal) → this is `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT Secret` (scroll down) → this is `SUPABASE_JWT_SECRET`
4. Optional: go to **Authentication → Providers → Email** and turn off
   "Confirm email" if you want signups to log straight in without an
   email confirmation step (fine for testing; keep it on for production).

### 2. Get a free Gemini API key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **Create API key** → copy it. This is `GEMINI_API_KEY`.
   The free tier is generous enough for personal testing/demo use.

### 3. Push this project to GitHub

```bash
cd jobpilot-v1
git init
git add .
git commit -m "JobPilot AI Level 1 — Resume Analyzer"
git branch -M main
git remote add origin https://github.com/<your-username>/jobpilot-ai.git
git push -u origin main
```

(Create the empty repo first at github.com/new — don't initialize it with
a README, this project already has one.)

### 4. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository**
   → select your repo.
2. **Root Directory**: leave as `.` (this is a single-project repo, not a
   monorepo — no need to change anything here).
3. Framework Preset auto-detects as **Next.js**.
4. Before clicking Deploy, add these **Environment Variables**:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from step 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from step 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from step 1 |
   | `SUPABASE_JWT_SECRET` | from step 1 |
   | `GEMINI_API_KEY` | from step 2 |
   | `GEMINI_MODEL` | `gemini-2.0-flash` |

5. Click **Deploy**. Takes about 1–2 minutes.

### 5. Test it live

1. Open your `https://your-project.vercel.app` URL.
2. You'll land on `/login` — sign up with any email/password.
3. You'll be redirected to `/resume` — drag in a PDF or DOCX resume.
4. Within a few seconds you'll see your parsed profile: name, contact
   info, skills, experience, education, certifications.

---

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in the same 6 values as above
npm run dev
```

Visit `http://localhost:3000`.

---

## Project structure

```
jobpilot-v1/
├── app/
│   ├── page.tsx              # redirects to /login or /resume based on session
│   ├── login/page.tsx        # signup/login form
│   ├── resume/page.tsx       # protected resume upload + results page
│   └── api/
│       └── resumes/
│           ├── route.ts          # GET — list user's resumes
│           └── upload/route.ts   # POST — upload, extract, parse, store
├── components/
│   ├── ui/                   # Card, Badge
│   ├── auth/auth-form.tsx
│   └── resume/                # uploader + profile view
├── lib/
│   ├── supabase-browser.ts   # client-side Supabase (anon key)
│   ├── supabase-admin.ts     # server-side Supabase (service role key)
│   ├── auth-server.ts        # verifies Supabase JWT in API routes
│   ├── gemini.ts             # Gemini REST call + prompt
│   └── text-extraction.ts    # PDF/DOCX → plain text
├── types/
│   ├── resume.ts
│   └── pdf-parse.d.ts        # type declaration (no official @types package)
└── supabase/
    └── schema.sql            # run this once in Supabase SQL Editor
```

## Why this deploys cleanly on Vercel (unlike the earlier FastAPI version)

The previous full version used a separate FastAPI backend, which needed a
second host (Render) since Vercel doesn't run long-lived Python/Docker
services — only serverless functions. This version replaces that backend
entirely with Next.js **API routes** (`app/api/.../route.ts`), which
Vercel deploys natively as serverless functions alongside the frontend.
One repo, one deploy, one URL.

## Troubleshooting

- **"Invalid or expired token" on upload** — your `SUPABASE_JWT_SECRET`
  env var doesn't match your project. Double-check you copied the JWT
  Secret (not the anon or service role key) from Project Settings → API.
- **Upload succeeds but returns a 502** — check `GEMINI_API_KEY` is set
  correctly and hasn't hit a free-tier rate limit; check the Vercel
  function logs (Deployments → your deployment → Functions) for the
  underlying Gemini error message.
- **Storage upload fails** — confirm the `resumes` bucket exists in
  Supabase Storage and is named exactly `resumes`.

## What's next (Level 2)

Job Search Agent — pulling live job listings from Greenhouse, Lever, and
SmartRecruiters' public job-board APIs (no scraping of ToS-restricted
sites like LinkedIn/Indeed), added as another set of API routes in this
same project. Say the word when you're ready.
