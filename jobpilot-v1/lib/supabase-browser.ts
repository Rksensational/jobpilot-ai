"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * Browser client — uses the public anon key. Safe to expose; all access
 * is governed by Row Level Security policies in supabase/schema.sql.
 */
export function createSupabaseBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
