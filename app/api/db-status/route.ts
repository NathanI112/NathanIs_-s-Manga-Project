import { NextResponse } from "next/server"
import { checkDbConnection } from "@/lib/db"

export async function GET() {
  try {
    const status = await checkDbConnection()

    if (status.connected) {
      return NextResponse.json({ status: "connected" })
    } else {
      return NextResponse.json({ status: "disconnected", error: status.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error checking database connection:", error)
    return NextResponse.json({ status: "error", message: "Failed to check database connection" }, { status: 500 })
  }
}

