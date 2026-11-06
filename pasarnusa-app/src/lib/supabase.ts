import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Client for public operations (Frontend & standard client requests)
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

// Admin client for backend API routes (Bypasses RLS, server-only)
export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceRoleKey || "placeholder-service-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Helper to reliably get next auto-increment ID
export async function getNextId(table: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from(table)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);
  return (data?.[0]?.id || 0) + 1;
}

export default supabase;
