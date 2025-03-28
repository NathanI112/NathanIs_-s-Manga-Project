import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Get manga by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = Number.parseInt(params.id)

    // Get manga details
    const { data: manga, error } = await supabase.from("manga").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Manga not found" }, { status: 404 })
      }
      throw error
    }

    // Get chapters
    const { data: chapters, error: chaptersError } = await supabase
      .from("chapters")
      .select("*")
      .eq("manga_id", id)
      .order("number", { ascending: false })

    if (chaptersError) {
      throw chaptersError
    }

    // Increment view count
    await supabase.rpc("increment_manga_views", { manga_id: id })

    return NextResponse.json({
      ...manga,
      chapters: chapters || [],
    })
  } catch (error) {
    console.error("Error fetching manga:", error)
    return NextResponse.json({ error: "Failed to fetch manga" }, { status: 500 })
  }
}

// Update manga
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = Number.parseInt(params.id)

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("uuid", session.user.id)
      .single()

    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const mangaData = await request.json()

    // Update manga
    const { data, error } = await supabase
      .from("manga")
      .update({
        title: mangaData.title,
        alternative_titles: mangaData.alternativeTitles || [],
        description: mangaData.description || "",
        author: mangaData.author || "",
        artist: mangaData.artist || "",
        cover: mangaData.cover || "",
        banner: mangaData.banner || "",
        status: mangaData.status || "ongoing",
        release_year: mangaData.releaseYear || null,
        genres: mangaData.genres || [],
        tags: mangaData.tags || [],
        is_adult: mangaData.isAdult || false,
        rating: mangaData.rating || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Manga not found" }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating manga:", error)
    return NextResponse.json({ error: "Failed to update manga" }, { status: 500 })
  }
}

// Delete manga
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = Number.parseInt(params.id)

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("uuid", session.user.id)
      .single()

    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete manga
    const { error } = await supabase.from("manga").delete().eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting manga:", error)
    return NextResponse.json({ error: "Failed to delete manga" }, { status: 500 })
  }
}

