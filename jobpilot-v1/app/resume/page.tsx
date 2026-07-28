"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ResumeUploader } from "@/components/resume/resume-uploader";
import { ResumeProfileView } from "@/components/resume/resume-profile-view";
import type { ResumeUploadResponse } from "@/types/resume";

export default function ResumePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeUploadResponse | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setUserEmail(data.session.user.email ?? null);
      setCheckingAuth(false);
    });
  }, [router]);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Resume Analyzer</h1>
          <p className="mt-1 text-sm text-slate-400">
            Upload your resume — AI extracts your skills, experience, and education.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </div>
      </div>

      <ResumeUploader onUploaded={setResult} />

      {result && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-900 bg-emerald-950/40 p-3 text-sm text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Resume parsed successfully — profile below.</span>
          </div>

          {result.warnings.length > 0 && (
            <div className="mb-4 space-y-2">
              {result.warnings.map((w, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-amber-900 bg-amber-950/40 p-3 text-sm text-amber-300"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          <ResumeProfileView parsed={result.parsed} />
        </div>
      )}
    </main>
  );
}
