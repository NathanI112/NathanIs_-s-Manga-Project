"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { CaptchaChallenge } from "./captcha-challenge"

interface RateLimitWarningProps {
  status?: number
  onVerify?: () => void
}

export function RateLimitWarning({ status = 429, onVerify }: RateLimitWarningProps) {
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    if (countdown > 0 && !showCaptcha) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, showCaptcha])

  const handleCaptchaVerify = (token: string) => {
    // Token'ı localStorage'a kaydet
    localStorage.setItem("security_verification", token)
    localStorage.setItem("security_verification_time", Date.now().toString())

    // Callback'i çağır
    if (onVerify) {
      onVerify()
    }

    // Captcha'yı kapat
    setShowCaptcha(false)
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{status === 429 ? "Çok Fazla İstek" : "Güvenlik Uyarısı"}</AlertTitle>
        <AlertDescription>
          {status === 429 ? (
            <>
              Çok fazla istek gönderdiniz. Lütfen{" "}
              {countdown > 0 ? `${countdown} saniye bekleyin` : "insan olduğunuzu doğrulayın"} ve tekrar deneyin.
            </>
          ) : (
            <>Güvenlik sistemimiz şüpheli bir aktivite tespit etti. Lütfen insan olduğunuzu doğrulayın.</>
          )}
        </AlertDescription>
      </Alert>

      {(countdown === 0 || status !== 429) && !showCaptcha && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowCaptcha(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            İnsan Olduğumu Doğrula
          </button>
        </div>
      )}

      {showCaptcha && <CaptchaChallenge onVerify={handleCaptchaVerify} onCancel={() => setShowCaptcha(false)} />}
    </div>
  )
}

