import { NextResponse } from "next/server"
import { userRepository } from "@/lib/db/repositories/user-repository"
import { cookies } from "next/headers"
import { sign } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: Request) {
  try {
    const { usernameOrEmail, password } = await request.json()

    // Basit doğrulama
    if (!usernameOrEmail || !password) {
      return NextResponse.json({ error: "Username/email and password are required" }, { status: 400 })
    }

    // Kullanıcı kimlik doğrulama
    const user = await userRepository.authenticateUser(usernameOrEmail, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Kullanıcı engellenmişse giriş yapmasını engelle
    if (user.isBanned) {
      return NextResponse.json({ error: "Your account has been banned", reason: user.banReason }, { status: 403 })
    }

    // JWT token oluştur
    const token = sign({ id: user.id, uuid: user.uuid, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    // Token'ı cookie olarak ayarla
    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 gün
      path: "/",
      sameSite: "strict",
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}

