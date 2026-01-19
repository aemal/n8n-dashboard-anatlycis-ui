import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Warning: SUPABASE_URL or SUPABASE_ANON_KEY not set. API calls will fail."
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase client not initialized. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables."
    );
  }
  return supabase;
}
