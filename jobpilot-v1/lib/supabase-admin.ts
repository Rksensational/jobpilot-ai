import { createClient } from "@supabase/supabase-js";

/**
 * Admin client — uses the SERVICE ROLE key. This bypasses Row Level
 * Security, so it must only ever be used inside API routes (server-side,
 * never bundled to the browser), and every query here must be manually
 * scoped to the verified user_id from the request's JWT.
 *
 * SUPABASE_SERVICE_ROLE_KEY is a server-only env var (no NEXT_PUBLIC_
 * prefix) so Next.js never exposes it to client bundles.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
