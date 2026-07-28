"use client";

import { createSupabaseBrowserClient } from "./supabase-browser";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new ApiError("Not authenticated. Please log in.", 401);
  }
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function apiGet<T>(path: string): Promise<T> {
  const authHeader = await getAuthHeader();
  const res = await fetch(path, { headers: authHeader });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.detail || res.statusText, res.status);
  }
  return res.json() as Promise<T>;
}

export async function uploadResume(file: File) {
  const authHeader = await getAuthHeader();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/resumes/upload", {
    method: "POST",
    headers: authHeader, // no Content-Type — browser sets multipart boundary
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.detail || res.statusText, res.status);
  }
  return res.json();
}
