import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import crypto from "crypto"

// Basit bir captcha sistemi
// Gerçek uygulamada reCAPTCHA veya hCaptcha gibi bir servis kullanılmalıdır

// Captcha token'larını saklamak için
// Gerçek uygulamada Redis gibi bir çözüm kullanılmalıdır
const captchaStore = new Map<
  string,
  {
    answer: string
    expires: number
  }
>()

// Captcha oluştur
export async function GET(request: NextRequest) {
  try {
    // Basit bir matematik problemi oluştur
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    const operation = Math.random() > 0.5 ? "+" : "-"

    let answer: number
    let question: string

    if (operation === "+") {
      answer = num1 + num2
      question = `${num1} + ${num2} = ?`
    } else {
      // Negatif sonuç olmaması için büyük sayıdan küçük sayıyı çıkar
      if (num1 >= num2) {
        answer = num1 - num2
        question = `${num1} - ${num2} = ?`
      } else {
        answer = num2 - num1
        question = `${num2} - ${num1} = ?`
      }
    }

    // Benzersiz bir token oluştur
    const token = crypto.randomBytes(32).toString("hex")

    // Token'ı sakla (5 dakika geçerli)
    captchaStore.set(token, {
      answer: answer.toString(),
      expires: Date.now() + 5 * 60 * 1000,
    })

    // Belirli bir süre sonra token'ı temizle
    setTimeout(
      () => {
        captchaStore.delete(token)
      },
      5 * 60 * 1000,
    )

    return NextResponse.json({
      token,
      question,
    })
  } catch (error) {
    console.error("Captcha oluşturma hatası:", error)
    return NextResponse.json({ error: "Captcha oluşturulamadı" }, { status: 500 })
  }
}

// Captcha doğrula
export async function POST(request: NextRequest) {
  try {
    const { token, answer } = await request.json()

    // Token kontrolü
    if (!token || !captchaStore.has(token)) {
      return NextResponse.json({ error: "Geçersiz captcha token" }, { status: 400 })
    }

    const captcha = captchaStore.get(token)!

    // Süre kontrolü
    if (Date.now() > captcha.expires) {
      captchaStore.delete(token)
      return NextResponse.json({ error: "Captcha süresi dolmuş" }, { status: 400 })
    }

    // Cevap kontrolü
    if (answer !== captcha.answer) {
      return NextResponse.json({ error: "Yanlış captcha cevabı" }, { status: 400 })
    }

    // Başarılı doğrulama
    captchaStore.delete(token)

    // Doğrulama token'ı oluştur
    const verificationToken = crypto.randomBytes(32).toString("hex")

    return NextResponse.json({
      success: true,
      verificationToken,
    })
  } catch (error) {
    console.error("Captcha doğrulama hatası:", error)
    return NextResponse.json({ error: "Captcha doğrulanamadı" }, { status: 500 })
  }
}

