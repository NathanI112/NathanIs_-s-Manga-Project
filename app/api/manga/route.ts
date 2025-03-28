import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Get all manga
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get query parameters
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")
    const search = url.searchParams.get("search") || ""
    const genre = url.searchParams.get("genre") || ""
    const status = url.searchParams.get("status") || ""
    const sort = url.searchParams.get("sort") || "updated_at"
    const order = url.searchParams.get("order") || "desc"

    // Calculate pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build query
    let query = supabase
      .from("manga")
      .select("*", { count: "exact" })
      .range(from, to)
      .order(sort, { ascending: order === "asc" })

    // Apply filters
    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    if (genre) {
      query = query.contains("genres", [genre])
    }

    if (status) {
      query = query.eq("status", status)
    }

    // Execute query
    const { data: manga, count, error } = await query

    if (error) {
      throw error
    }

    // If no data from Supabase, try to get from localStorage (for development)
    if (!manga || manga.length === 0) {
      // Mock data for development
      const mockManga = [
        {
          id: 1,
          title: "One Piece",
          cover: "/placeholder.svg?height=400&width=300&text=One+Piece",
          rating: 4.9,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: "Naruto",
          cover: "/placeholder.svg?height=400&width=300&text=Naruto",
          rating: 4.7,
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          title: "Attack on Titan",
          cover: "/placeholder.svg?height=400&width=300&text=Attack+on+Titan",
          rating: 4.8,
          createdAt: new Date().toISOString(),
        },
      ]

      return NextResponse.json({
        data: mockManga,
        pagination: {
          page,
          limit,
          totalItems: mockManga.length,
          totalPages: 1,
        },
      })
    }

    // Calculate total pages
    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      data: manga,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching manga:", error)

    // Return an empty array instead of an error to prevent client-side errors
    return NextResponse.json({
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        totalItems: 0,
        totalPages: 0,
      },
    })
  }
}

// Add new manga
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

    const mangaData = await request.json()

    // Validate required fields
    if (!mangaData.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Insert manga
    const { data, error } = await supabase
      .from("manga")
      .insert({
        title: mangaData.title,
        alternative_titles: mangaData.alternativeTitles || [],
        description: mangaData.description || "",
        author: mangaData.author || "",
        artist: mangaData.artist || "",
        cover: mangaData.cover || "/placeholder.svg?height=400&width=300",
        banner: mangaData.banner || "",
        status: mangaData.status || "ongoing",
        release_year: mangaData.releaseYear || null,
        genres: mangaData.genres || [],
        tags: mangaData.tags || [],
        is_adult: mangaData.isAdult || false,
        rating: mangaData.rating || 0,
        views: mangaData.views || 0,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error adding manga:", error)
    return NextResponse.json({ error: "Failed to add manga" }, { status: 500 })
  }
}

