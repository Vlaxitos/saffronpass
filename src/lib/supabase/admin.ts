import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "./env";

/**
 * Strictly server-only Supabase admin client powered by SUPABASE_SECRET_KEY.
 * NEVER import this module in any Client Component.
 * Used exclusively by server-side guest invite loaders and RSVP route handlers
 * so all database tables remain 100% locked down against anonymous queries.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() must only be called on the server.");
  }

  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY environment variable. Add it in .env.local and Vercel server env settings."
    );
  }

  return createClient(getSupabaseUrl(), secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
