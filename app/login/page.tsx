"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSupabaseAuth } from "@/components/supabase-auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useSupabaseAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL'den hata parametrelerini kontrol et
  useEffect(() => {
    const errorParam = searchParams.get("error")
    const errorCode = searchParams.get("error_code")
    const errorDescription = searchParams.get("error_description")

    if (errorParam || errorCode) {
      if (errorCode === "otp_expired") {
        setError("Doğrulama bağlantısı süresi doldu. Lütfen tekrar giriş yapmayı deneyin.")
      } else if (errorDescription) {
        setError(decodeURIComponent(errorDescription))
      } else {
        setError("Giriş yaparken bir hata oluştu. Lütfen tekrar deneyin.")
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await signIn(email, password)
      if (error) throw error

      router.push("/")
    } catch (error: any) {
      setError(error?.message || "Giriş yapılırken bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-theme(spacing.14))]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Giriş Yap</CardTitle>
          <CardDescription>Manga okumaya başlamak için hesabınıza giriş yapın.</CardDescription>
        </CardHeader>

        {error && (
          <CardContent className="pt-0">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hata</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Şifre</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Şifremi Unuttum
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Button>
            <div className="text-center text-sm">
              Hesabınız yok mu?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Kaydol
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

