import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY Supabase client using the service_role key.
 *
 * This key bypasses Row Level Security entirely. Never import this file
 * from a Client Component, never send this key to the browser, and never
 * prefix it with NEXT_PUBLIC_.
 *
 * Use only in Route Handlers / Server Actions that need elevated
 * privileges (e.g. admin user management).
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
