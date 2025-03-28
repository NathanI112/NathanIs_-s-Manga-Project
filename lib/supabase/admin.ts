import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Create a Supabase client with the service role key
// This bypasses RLS policies and should ONLY be used in server-side code
export const createAdminSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables for admin client")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

