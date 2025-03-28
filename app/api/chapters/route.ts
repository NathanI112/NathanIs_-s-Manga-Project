import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Get all chapters
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: chapters, error } = await supabase
      .from("chapters")
      .select("*")
      .order("upload_date", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(chapters || [])
  } catch (error) {
    console.error("Error fetching chapters:", error)
    return NextResponse.json({ error: "Failed to fetch chapters" }, { status: 500 })
  }
}

// Add new chapter
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

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

    const chapterData = await request.json()

    // Validate required fields
    if (!chapterData.mangaId) {
      return NextResponse.json({ error: "Manga ID is required" }, { status: 400 })
    }

    if (!chapterData.number) {
      return NextResponse.json({ error: "Chapter number is required" }, { status: 400 })
    }

    // Insert chapter
    const { data, error } = await supabase
      .from("chapters")
      .insert({
        manga_id: chapterData.mangaId,
        number: chapterData.number,
        title: chapterData.title || `Chapter ${chapterData.number}`,
        pages: chapterData.pages || 0,
        page_urls: chapterData.pageUrls || [],
        views: chapterData.views || 0,
        upload_date: chapterData.uploadDate || new Date().toISOString(),
        is_published: chapterData.isPublished !== undefined ? chapterData.isPublished : true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Update manga's updated_at timestamp
    await supabase.from("manga").update({ updated_at: new Date().toISOString() }).eq("id", chapterData.mangaId)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error adding chapter:", error)
    return NextResponse.json({ error: "Failed to add chapter" }, { status: 500 })
  }
}

