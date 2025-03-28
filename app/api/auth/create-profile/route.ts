import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { uuid, username, email } = await request.json()

    if (!uuid || !username || !email) {
      return NextResponse.json({ error: "UUID, username, and email are required" }, { status: 400 })
    }

    // Use the admin client to bypass RLS policies
    const supabase = createAdminSupabaseClient()

    // Create user profile
    const { error } = await supabase.from("users").insert({
      uuid,
      username,
      email,
      role: "user",
      is_active: true,
      is_banned: false,
    })

    if (error) {
      console.error("Error creating user profile:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in create-profile API:", error)
    return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
  }
}

