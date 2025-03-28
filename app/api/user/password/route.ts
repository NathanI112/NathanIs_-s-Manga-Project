import { NextResponse } from "next/server"
import { userRepository } from "@/lib/db/repositories/user-repository"
import { getCurrentUser } from "@/lib/auth/session"

// Kullanıcı şifresini güncelle
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    // Basit doğrulama
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    // Şifre güncelleme
    const result = await userRepository.updatePassword(user.id, currentPassword, newPassword)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
  }
}

