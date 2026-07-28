import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-50">JobPilot AI</h1>
      <p className="mb-8 text-sm text-slate-400">Log in to analyze your resume</p>
      <AuthForm />
    </main>
  );
}
