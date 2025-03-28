import { NextResponse } from "next/server"
import { mangaRepository } from "@/lib/db/repositories/manga-repository"
import { getCurrentUser } from "@/lib/auth/session"

// Kullanıcının kütüphanesini getir
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const library = await mangaRepository.getUserLibrary(user.id)

    return NextResponse.json({ library })
  } catch (error) {
    console.error("Error fetching library:", error)
    return NextResponse.json({ error: "Failed to fetch library" }, { status: 500 })
  }
}

// Kütüphaneye manga ekle/güncelle
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mangaId, status, isFavorite, rating, progress, notes } = await request.json()

    if (!mangaId) {
      return NextResponse.json({ error: "Manga ID is required" }, { status: 400 })
    }

    const result = await mangaRepository.updateUserLibrary(user.id, mangaId, {
      status,
      isFavorite,
      rating,
      progress,
      notes,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating library:", error)
    return NextResponse.json({ error: "Failed to update library" }, { status: 500 })
  }
}

