"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabaseAuth } from "@/components/supabase-auth-provider"
import { createClientSupabaseClient } from "@/lib/supabase/supabase-client"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useSupabaseAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        setError(error.message)
        return
      }

      // Check if user is admin
      const supabase = createClientSupabaseClient()
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("email", email)
        .single()

      if (userError || !userData) {
        setError("Kullanıcı bilgileri alınamadı.")
        return
      }

      if (userData.role !== "admin") {
        setError("Bu sayfaya erişim yetkiniz yok.")
        await supabase.auth.signOut()
        return
      }

      router.push("/admin/dashboard")
    } catch (err) {
      setError("Giriş yapılırken bir hata oluştu.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Girişi</CardTitle>
          <CardDescription>Yönetici hesabınızla giriş yapın.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-sm font-medium text-destructive">{error}</div>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

