import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

let supabaseClient: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  // Doğru site URL'sini ayarlayalım
  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "https://your-production-url.com"

  supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      // Doğrulama e-postalarında kullanılacak URL'yi ayarlayalım
      redirectTo: `${siteUrl}/auth/callback`,
    },
  })
  return supabaseClient
}

