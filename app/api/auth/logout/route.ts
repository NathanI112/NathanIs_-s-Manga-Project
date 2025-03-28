import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Auth token cookie'sini sil
    cookies().delete("auth_token")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}

