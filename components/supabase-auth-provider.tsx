"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type SupabaseAuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
        }

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Check if user is admin
          const { data, error } = await supabase.from("users").select("role").eq("uuid", session.user.id).single()

          if (!error && data) {
            setIsAdmin(data.role === "admin")
          }
        }
      } catch (e) {
        console.error("Error in getSession:", e)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // Check if user is admin
        supabase
          .from("users")
          .select("role")
          .eq("uuid", session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              setIsAdmin(data.role === "admin")
            }
          })
      } else {
        setIsAdmin(false)
      }

      setIsLoading(false)
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Site URL'sini alalım
      const siteUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "https://your-production-url.com"

      // Auth kullanıcısını oluşturalım
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Doğrulama e-postası için doğru URL'yi ayarlayalım
          emailRedirectTo: `${siteUrl}/auth/callback`,
          data: {
            username,
          },
        },
      })

      if (error) {
        return { error }
      }

      if (!data.user) {
        return { error: new Error("Failed to create user") }
      }

      // Kullanıcı profilini oluşturmak için server-side API'yi kullanalım
      const response = await fetch("/api/auth/create-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uuid: data.user.id,
          username,
          email,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("Error creating user profile:", result.error)
        return { error: new Error(result.error || "Failed to create user profile") }
      }

      return { error: null }
    } catch (error) {
      console.error("Error in signUp:", error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    isAdmin,
  }

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>
}

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext)
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider")
  }
  return context
}

