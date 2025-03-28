"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabaseAuth } from "./supabase-auth-provider"

// Define the user type
interface UserPreferences {
  readerMode: "horizontal" | "vertical"
  theme: "light" | "dark" | "system"
  autoNext: boolean
}

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  isAdmin: boolean
  preferences: UserPreferences
}

// Define the auth context type
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user: supabaseUser, isAdmin, signIn, signUp, signOut, isLoading: supabaseLoading } = useSupabaseAuth()

  // Update user when supabase user changes
  useEffect(() => {
    if (!supabaseLoading) {
      if (supabaseUser) {
        // Convert Supabase user to our User type
        setUser({
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || "User",
          email: supabaseUser.email || "",
          isAdmin: isAdmin,
          preferences: {
            readerMode: "vertical",
            theme: "system",
            autoNext: true,
          },
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }
  }, [supabaseUser, supabaseLoading, isAdmin])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { error } = await signIn(email, password)
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Login failed" }
    }
  }

  // Register function
  const register = async (username: string, email: string, password: string) => {
    try {
      const { error } = await signUp(email, password, username)
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Registration failed" }
    }
  }

  // Logout function
  const logout = async () => {
    await signOut()
    setUser(null)
  }

  // Create the auth value
  const authValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
}

// Create a hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

