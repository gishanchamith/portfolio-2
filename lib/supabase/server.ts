import { createClient as createSupabaseClient } from "@supabase/supabase-js"

function getSupabaseCredentials() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) is not defined")
  }

  if (!supabaseKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) is not defined")
  }

  return { supabaseUrl, supabaseKey }
}

export function createClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseCredentials()
  return createSupabaseClient(supabaseUrl, supabaseKey)
}
