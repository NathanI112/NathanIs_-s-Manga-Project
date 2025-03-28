import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Get chapter by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = Number.parseInt(params.id)

    // Get chapter details
    const { data: chapter, error } = await supabase
      .from("chapters")
      .select("*, manga:manga_id(*)")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
      }
      throw error
    }

    // Increment view count
    await supabase.rpc("increment_chapter_views", { chapter_id: id })

    return NextResponse.json(chapter)
  } catch (error) {
    console.error("Error fetching chapter:", error)
    return NextResponse.json({ error: "Failed to fetch chapter" }, { status: 500 })
  }
}

// Update chapter
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

    const chapterData = await request.json()

    // Update chapter
    const { data, error } = await supabase
      .from("chapters")
      .update({
        number: chapterData.number,
        title: chapterData.title,
        pages: chapterData.pages,
        page_urls: chapterData.pageUrls,
        is_published: chapterData.isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating chapter:", error)
    return NextResponse.json({ error: "Failed to update chapter" }, { status: 500 })
  }
}

// Delete chapter
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

    // Delete chapter
    const { error } = await supabase.from("chapters").delete().eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting chapter:", error)
    return NextResponse.json({ error: "Failed to delete chapter" }, { status: 500 })
  }
}

