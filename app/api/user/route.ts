import { NextResponse } from "next/server"
import { userRepository } from "@/lib/db/repositories/user-repository"
import { getCurrentUser } from "@/lib/auth/session"

// Kullanıcı bilgilerini getir
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}

// Kullanıcı bilgilerini güncelle
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userData = await request.json()

    // Güvenlik için role ve isActive gibi alanları kaldır
    delete userData.role
    delete userData.isActive
    delete userData.isBanned

    const updatedUser = await userRepository.updateUser(user.id, userData)

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user data" }, { status: 500 })
  }
}

