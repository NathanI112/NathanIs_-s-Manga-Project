import { type NextRequest, NextResponse } from "next/server"
import { migrateFromLocalStorage, addSampleData } from "@/lib/db"

// localStorage'dan verileri taşı
export async function POST(request: NextRequest) {
  try {
    await migrateFromLocalStorage()
    return NextResponse.json({ success: true, message: "Veri taşıma işlemi tamamlandı" })
  } catch (error) {
    console.error("Veri taşıma hatası:", error)
    return NextResponse.json({ error: "Veri taşıma işlemi başarısız oldu" }, { status: 500 })
  }
}

// Örnek veri ekle
export async function PUT(request: NextRequest) {
  try {
    await addSampleData()
    return NextResponse.json({ success: true, message: "Örnek veriler eklendi" })
  } catch (error) {
    console.error("Örnek veri ekleme hatası:", error)
    return NextResponse.json({ error: "Örnek veri ekleme işlemi başarısız oldu" }, { status: 500 })
  }
}

