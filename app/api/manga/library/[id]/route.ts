import { NextResponse } from "next/server"
import { mangaRepository } from "@/lib/db/repositories/manga-repository"
import { getCurrentUser } from "@/lib/auth/session"

// Kütüphaneden manga kaldır
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const mangaId = Number.parseInt(params.id)

    if (isNaN(mangaId)) {
      return NextResponse.json({ error: "Invalid manga ID" }, { status: 400 })
    }

    await mangaRepository.removeFromUserLibrary(user.id, mangaId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing from library:", error)
    return NextResponse.json({ error: "Failed to remove from library" }, { status: 500 })
  }
}

