import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SupabaseAuthProvider } from "@/components/supabase-auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Manga Okuma Sitesi",
    template: "%s | Manga Okuma Sitesi",
  },
  description: "En sevdiğiniz mangaları okuyun ve keşfedin.",
  keywords: ["manga", "anime", "okuma", "çizgi roman", "japon", "webtoon"],
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'