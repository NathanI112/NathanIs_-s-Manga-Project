import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Get chapters by manga ID
export async function GET(request: NextRequest, { params }: { params: { mangaId: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const mangaId = Number.parseInt(params.mangaId)

    const { data: chapters, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("manga_id", mangaId)
      .order("number", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(chapters || [])
  } catch (error) {
    console.error("Error fetching chapters:", error)
    return NextResponse.json({ error: "Failed to fetch chapters" }, { status: 500 })
  }
}

