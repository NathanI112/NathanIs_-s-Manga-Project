import { NextResponse } from "next/server"
import { userRepository } from "@/lib/db/repositories/user-repository"

export async function POST(request: Request) {
  try {
    const { username, email, password, avatar, bio, favoriteGenres } = await request.json()

    // Basit doğrulama
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email and password are required" }, { status: 400 })
    }

    // Kullanıcı oluştur
    const user = await userRepository.createUser({
      username,
      email,
      password,
      avatar,
      bio,
      favoriteGenres,
    })

    // Hassas bilgileri çıkar
    const { passwordHash, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error: any) {
    console.error("Registration error:", error)

    // Duplicate key hatası kontrolü
    if (error.code === "23505") {
      if (error.detail.includes("username")) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 })
      }
      if (error.detail.includes("email")) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 })
      }
    }

    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}

