export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          uuid: string
          username: string
          email: string
          avatar_url: string | null
          bio: string | null
          role: "user" | "admin"
          is_active: boolean
          is_banned: boolean
          ban_reason: string | null
          preferences: Json | null
          favorite_genres: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          uuid?: string
          username: string
          email: string
          avatar_url?: string | null
          bio?: string | null
          role?: "user" | "admin"
          is_active?: boolean
          is_banned?: boolean
          ban_reason?: string | null
          preferences?: Json | null
          favorite_genres?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          uuid?: string
          username?: string
          email?: string
          avatar_url?: string | null
          bio?: string | null
          role?: "user" | "admin"
          is_active?: boolean
          is_banned?: boolean
          ban_reason?: string | null
          preferences?: Json | null
          favorite_genres?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      manga: {
        Row: {
          id: number
          uuid: string
          title: string
          alternative_titles: string[] | null
          description: string | null
          author: string | null
          artist: string | null
          cover: string | null
          banner: string | null
          status: "ongoing" | "completed" | "hiatus" | "cancelled"
          release_year: number | null
          genres: string[] | null
          tags: string[] | null
          is_adult: boolean
          rating: number
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          uuid?: string
          title: string
          alternative_titles?: string[] | null
          description?: string | null
          author?: string | null
          artist?: string | null
          cover?: string | null
          banner?: string | null
          status?: "ongoing" | "completed" | "hiatus" | "cancelled"
          release_year?: number | null
          genres?: string[] | null
          tags?: string[] | null
          is_adult?: boolean
          rating?: number
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          uuid?: string
          title?: string
          alternative_titles?: string[] | null
          description?: string | null
          author?: string | null
          artist?: string | null
          cover?: string | null
          banner?: string | null
          status?: "ongoing" | "completed" | "hiatus" | "cancelled"
          release_year?: number | null
          genres?: string[] | null
          tags?: string[] | null
          is_adult?: boolean
          rating?: number
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      chapters: {
        Row: {
          id: number
          uuid: string
          manga_id: number
          number: string
          title: string | null
          pages: number
          page_urls: string[] | null
          views: number
          upload_date: string
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          uuid?: string
          manga_id: number
          number: string
          title?: string | null
          pages?: number
          page_urls?: string[] | null
          views?: number
          upload_date?: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          uuid?: string
          manga_id?: number
          number?: string
          title?: string | null
          pages?: number
          page_urls?: string[] | null
          views?: number
          upload_date?: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_manga: {
        Row: {
          id: number
          user_id: number
          manga_id: number
          status: "reading" | "completed" | "on_hold" | "dropped" | "plan_to_read"
          is_favorite: boolean
          rating: number | null
          progress: number
          start_date: string | null
          finish_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          manga_id: number
          status?: "reading" | "completed" | "on_hold" | "dropped" | "plan_to_read"
          is_favorite?: boolean
          rating?: number | null
          progress?: number
          start_date?: string | null
          finish_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          manga_id?: number
          status?: "reading" | "completed" | "on_hold" | "dropped" | "plan_to_read"
          is_favorite?: boolean
          rating?: number | null
          progress?: number
          start_date?: string | null
          finish_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_reads: {
        Row: {
          id: number
          user_id: number
          chapter_id: number
          progress: number
          is_completed: boolean
          last_read_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          chapter_id: number
          progress?: number
          is_completed?: boolean
          last_read_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          chapter_id?: number
          progress?: number
          is_completed?: boolean
          last_read_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: number
          uuid: string
          user_id: number
          manga_id: number | null
          chapter_id: number | null
          parent_id: number | null
          content: string
          likes: number
          status: "active" | "deleted" | "hidden"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          uuid?: string
          user_id: number
          manga_id?: number | null
          chapter_id?: number | null
          parent_id?: number | null
          content: string
          likes?: number
          status?: "active" | "deleted" | "hidden"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          uuid?: string
          user_id?: number
          manga_id?: number | null
          chapter_id?: number | null
          parent_id?: number | null
          content?: string
          likes?: number
          status?: "active" | "deleted" | "hidden"
          created_at?: string
          updated_at?: string
        }
      }
      comment_likes: {
        Row: {
          id: number
          user_id: number
          comment_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          comment_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          comment_id?: number
          created_at?: string
        }
      }
      user_activities: {
        Row: {
          id: number
          user_id: number
          type: string
          manga_id: number | null
          chapter_id: number | null
          comment_id: number | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          type: string
          manga_id?: number | null
          chapter_id?: number | null
          comment_id?: number | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          type?: string
          manga_id?: number | null
          chapter_id?: number | null
          comment_id?: number | null
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

