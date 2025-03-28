import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { CookieOptions } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  const cookieStore = cookies()

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_code = requestUrl.searchParams.get("error_code")
  const error_description = requestUrl.searchParams.get("error_description")

  if (error || error_code) {
    // Kullanıcıyı hata sayfasına yönlendir ve parametreleri aktar
    const redirectUrl = new URL("/login", requestUrl.origin)
    redirectUrl.searchParams.set("error", error || "")
    redirectUrl.searchParams.set("error_code", error_code || "")
    redirectUrl.searchParams.set("error_description", error_description || "")

    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    })

    try {
      // Sessiona başlayın ve kullanıcıya yönlendirin
      await supabase.auth.exchangeCodeForSession(code)
      return NextResponse.redirect(new URL("/", requestUrl.origin))
    } catch (error) {
      console.error("Auth callback error:", error)
      // Hata durumunda login sayfasına yönlendir
      return NextResponse.redirect(new URL("/login?error=session_error", requestUrl.origin))
    }
  }

  // Kod yoksa ana sayfaya yönlendir
  return NextResponse.redirect(new URL("/", requestUrl.origin))
}

