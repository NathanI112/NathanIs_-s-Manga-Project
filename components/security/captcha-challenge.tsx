"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CaptchaChallengeProps {
  onVerify: (token: string) => void
  onCancel?: () => void
}

export function CaptchaChallenge({ onVerify, onCancel }: CaptchaChallengeProps) {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaQuestion, setCaptchaQuestion] = useState<string | null>(null)
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  // Captcha yükle
  const loadCaptcha = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/security/captcha")
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setCaptchaToken(data.token)
        setCaptchaQuestion(data.question)
        setAnswer("")
      }
    } catch (err) {
      setError("Captcha yüklenirken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setLoading(false)
    }
  }

  // Captcha doğrula
  const verifyCaptcha = async () => {
    if (!captchaToken || !answer) return

    setVerifying(true)
    setError(null)

    try {
      const response = await fetch("/api/security/captcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: captchaToken,
          answer,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        // Yanlış cevap durumunda yeni captcha yükle
        loadCaptcha()
      } else if (data.success && data.verificationToken) {
        onVerify(data.verificationToken)
      }
    } catch (err) {
      setError("Captcha doğrulanırken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setVerifying(false)
    }
  }

  // Sayfa yüklendiğinde captcha yükle
  useEffect(() => {
    loadCaptcha()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Güvenlik Doğrulaması</CardTitle>
        <CardDescription>Lütfen aşağıdaki soruyu cevaplayarak insan olduğunuzu doğrulayın.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Hata</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {captchaQuestion ? (
            <div className="p-4 bg-muted rounded-md text-center">
              <p className="text-lg font-medium">{captchaQuestion}</p>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-md text-center animate-pulse">
              <p className="text-lg font-medium">Yükleniyor...</p>
            </div>
          )}

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Cevabınızı girin"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={loading || verifying || !captchaToken}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={verifying}>
            İptal
          </Button>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadCaptcha} disabled={loading || verifying}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={verifyCaptcha} disabled={!captchaToken || !answer || loading || verifying}>
            {verifying ? "Doğrulanıyor..." : "Doğrula"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

