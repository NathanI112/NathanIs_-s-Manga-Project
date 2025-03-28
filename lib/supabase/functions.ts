import { createServerSupabaseClient } from "./server"
import { createClientSupabaseClient } from "./client"

// Server-side functions
export async function getMangaById(id: number) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("manga").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching manga:", error)
    return null
  }

  // Get chapters
  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", id)
    .order("number", { ascending: false })

  if (chaptersError) {
    console.error("Error fetching chapters:", chaptersError)
  }

  // Increment view count
  await supabase.rpc("increment_manga_views", { manga_id: id })

  return {
    ...data,
    chapters: chapters || [],
  }
}

export async function getChapterById(id: number) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("chapters").select("*, manga:manga_id(*)").eq("id", id).single()

  if (error) {
    console.error("Error fetching chapter:", error)
    return null
  }

  // Increment view count
  await supabase.rpc("increment_chapter_views", { chapter_id: id })

  return data
}

export async function getPopularManga(limit = 10) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("manga").select("*").order("views", { ascending: false }).limit(limit)

  if (error) {
    console.error("Error fetching popular manga:", error)
    return []
  }

  return data
}

export async function getLatestUpdatedManga(limit = 10) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.rpc("get_latest_updated_manga", { limit_count: limit })

  if (error) {
    console.error("Error fetching latest manga:", error)
    return []
  }

  return data
}

export async function getChaptersByMangaId(mangaId: number) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", mangaId)
    .order("number", { ascending: false })

  if (error) {
    console.error("Error fetching chapters:", error)
    return []
  }

  return data
}

// Client-side functions
export function useSupabase() {
  const supabase = createClientSupabaseClient()

  return {
    getMangaList: async (
      options: {
        page?: number
        limit?: number
        search?: string
        genre?: string
        status?: string
        sort?: string
        order?: "asc" | "desc"
      } = {},
    ) => {
      const {
        page = 1,
        limit = 20,
        search = "",
        genre = "",
        status = "",
        sort = "updated_at",
        order = "desc",
      } = options

      const from = (page - 1) * limit
      const to = from + limit - 1

      let query = supabase
        .from("manga")
        .select("*", { count: "exact" })
        .range(from, to)
        .order(sort, { ascending: order === "asc" })

      if (search) {
        query = query.ilike("title", `%${search}%`)
      }

      if (genre) {
        query = query.contains("genres", [genre])
      }

      if (status) {
        query = query.eq("status", status)
      }

      const { data, count, error } = await query

      if (error) {
        console.error("Error fetching manga list:", error)
        return { data: [], pagination: { page, limit, totalItems: 0, totalPages: 0 } }
      }

      const totalPages = Math.ceil((count || 0) / limit)

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          totalItems: count || 0,
          totalPages,
        },
      }
    },

    getUserLibrary: async () => {
      const { data, error } = await supabase.rpc("get_user_library")

      if (error) {
        console.error("Error fetching user library:", error)
        return []
      }

      return data || []
    },

    getUserReadingHistory: async (limit = 10) => {
      const { data, error } = await supabase.rpc("get_user_reading_history", { limit_count: limit })

      if (error) {
        console.error("Error fetching reading history:", error)
        return []
      }

      return data || []
    },

    addToLibrary: async (mangaId: number, status = "plan_to_read", isFavorite = false) => {
      const { data: user } = await supabase.auth.getUser()

      if (!user.user) {
        throw new Error("User not authenticated")
      }

      // Check if manga is already in library
      const { data: existing, error: checkError } = await supabase
        .from("user_manga")
        .select("id")
        .eq("user_id", user.user.id)
        .eq("manga_id", mangaId)
        .maybeSingle()

      if (checkError) {
        console.error("Error checking library:", checkError)
        throw checkError
      }

      if (existing) {
        // Update existing entry
        const { data, error } = await supabase
          .from("user_manga")
          .update({
            status,
            is_favorite: isFavorite,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single()

        if (error) {
          console.error("Error updating library:", error)
          throw error
        }

        return data
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from("user_manga")
          .insert({
            user_id: user.user.id,
            manga_id: mangaId,
            status,
            is_favorite: isFavorite,
          })
          .select()
          .single()

        if (error) {
          console.error("Error adding to library:", error)
          throw error
        }

        return data
      }
    },

    removeFromLibrary: async (mangaId: number) => {
      const { data: user } = await supabase.auth.getUser()

      if (!user.user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase.from("user_manga").delete().eq("user_id", user.user.id).eq("manga_id", mangaId)

      if (error) {
        console.error("Error removing from library:", error)
        throw error
      }

      return true
    },
  }
}

