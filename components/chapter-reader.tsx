"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Settings, Home, List } from "lucide-react"
import { useSupabaseAuth } from "@/components/supabase-auth-provider"
import { createClientSupabaseClient } from "@/lib/supabase/client"

interface ChapterReaderProps {
  mangaId: number
  chapterId: number
  chapterNumber: string
  pageUrls: string[]
}

export function ChapterReader({ mangaId, chapterId, chapterNumber, pageUrls }: ChapterReaderProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(pageUrls.length)
  const [nextChapter, setNextChapter] = useState<{ id: number; number: string } | null>(null)
  const [prevChapter, setPrevChapter] = useState<{ id: number; number: string } | null>(null)
  const [isVerticalMode, setIsVerticalMode] = useState(true)
  const { user } = useSupabaseAuth()
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    // Reset to first page when chapter changes
    setCurrentPage(1)
    setTotalPages(pageUrls.length)

    // Fetch adjacent chapters
    fetchAdjacentChapters()

    // Save reading progress if user is logged in
    if (user) {
      saveReadingProgress(1)
    }
  }, [chapterId, pageUrls, user])

  const fetchAdjacentChapters = async () => {
    try {
      // Get all chapters for this manga
      const { data: chapters, error } = await supabase
        .from("chapters")
        .select("id, number")
        .eq("manga_id", mangaId)
        .order("number", { ascending: true })

      if (error) throw error

      if (chapters && chapters.length > 0) {
        // Find current chapter index
        const currentIndex = chapters.findIndex((c) => c.id === chapterId)

        if (currentIndex > 0) {
          setPrevChapter(chapters[currentIndex - 1])
        } else {
          setPrevChapter(null)
        }

        if (currentIndex < chapters.length - 1) {
          setNextChapter(chapters[currentIndex + 1])
        } else {
          setNextChapter(null)
        }
      }
    } catch (error) {
      console.error("Error fetching adjacent chapters:", error)
    }
  }

  const saveReadingProgress = async (page: number) => {
    if (!user) return

    try {
      // Check if there's an existing reading record
      const { data: existingRecord, error: checkError } = await supabase
        .from("user_reads")
        .select("*")
        .eq("user_id", user.id)
        .eq("chapter_id", chapterId)
        .maybeSingle()

      const isCompleted = page >= totalPages * 0.9 // Mark as completed if read 90% of pages

      if (existingRecord) {
        // Update existing record
        await supabase
          .from("user_reads")
          .update({
            progress: page,
            is_completed: isCompleted,
            last_read_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingRecord.id)
      } else {
        // Create new record
        await supabase.from("user_reads").insert({
          user_id: user.id,
          chapter_id: chapterId,
          progress: page,
          is_completed: isCompleted,
          last_read_at: new Date().toISOString(),
        })
      }

      // Also update user_manga progress if needed
      if (isCompleted) {
        const { data: userManga, error: userMangaError } = await supabase
          .from("user_manga")
          .select("*")
          .eq("user_id", user.id)
          .eq("manga_id", mangaId)
          .maybeSingle()

        if (userManga) {
          // Update progress if this chapter is newer
          const chapterNum = Number.parseInt(chapterNumber) || 0
          if (chapterNum > userManga.progress) {
            await supabase
              .from("user_manga")
              .update({
                progress: chapterNum,
                status: "reading",
                updated_at: new Date().toISOString(),
              })
              .eq("id", userManga.id)
          }
        } else {
          // Create new user_manga entry
          await supabase.from("user_manga").insert({
            user_id: user.id,
            manga_id: mangaId,
            status: "reading",
            progress: Number.parseInt(chapterNumber) || 0,
            is_favorite: false,
          })
        }
      }
    } catch (error) {
      console.error("Error saving reading progress:", error)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      if (user) {
        saveReadingProgress(newPage)
      }
    } else if (nextChapter) {
      // Go to next chapter
      router.push(`/manga/${mangaId}/chapter/${nextChapter.id}`)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      if (user) {
        saveReadingProgress(newPage)
      }
    } else if (prevChapter) {
      // Go to previous chapter
      router.push(`/manga/${mangaId}/chapter/${prevChapter.id}`)
    }
  }

  const toggleReadingMode = () => {
    setIsVerticalMode(!isVerticalMode)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/manga/${mangaId}`}>
              <Home className="h-4 w-4 mr-1" />
              Manga Sayfası
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={toggleReadingMode}>
            <Settings className="h-4 w-4 mr-1" />
            {isVerticalMode ? "Yatay Mod" : "Dikey Mod"}
          </Button>
        </div>
        <div className="text-sm">
          Sayfa {currentPage} / {totalPages}
        </div>
        <div className="flex gap-2">
          {prevChapter && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/manga/${mangaId}/chapter/${prevChapter.id}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Önceki Bölüm
              </Link>
            </Button>
          )}
          {nextChapter && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/manga/${mangaId}/chapter/${nextChapter.id}`}>
                Sonraki Bölüm
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden mb-6">
        <div className={`relative ${isVerticalMode ? "flex flex-col items-center" : ""}`}>
          {isVerticalMode ? (
            // Vertical reading mode
            pageUrls.map((url, index) => (
              <div key={index} className="w-full max-w-3xl mx-auto mb-2">
                <Image
                  src={url || "/placeholder.svg"}
                  alt={`Page ${index + 1}`}
                  width={800}
                  height={1200}
                  className="w-full h-auto"
                  priority={index < 3} // Prioritize loading first 3 images
                />
              </div>
            ))
          ) : (
            // Horizontal reading mode
            <div className="relative w-full max-w-3xl mx-auto">
              <Image
                src={pageUrls[currentPage - 1] || "/placeholder.svg"}
                alt={`Page ${currentPage}`}
                width={800}
                height={1200}
                className="w-full h-auto"
                priority
              />
              <div className="absolute inset-0 flex justify-between">
                <div className="w-1/2 cursor-pointer" onClick={handlePrevPage} title="Previous Page" />
                <div className="w-1/2 cursor-pointer" onClick={handleNextPage} title="Next Page" />
              </div>
            </div>
          )}
        </div>
      </Card>

      {!isVerticalMode && (
        <div className="flex justify-between items-center mb-6">
          <Button onClick={handlePrevPage} disabled={currentPage === 1 && !prevChapter} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Önceki Sayfa
          </Button>
          <div className="text-sm font-medium">
            Sayfa {currentPage} / {totalPages}
          </div>
          <Button onClick={handleNextPage} disabled={currentPage === totalPages && !nextChapter} variant="outline">
            Sonraki Sayfa
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/manga/${mangaId}`}>
            <List className="h-4 w-4 mr-1" />
            Bölüm Listesi
          </Link>
        </Button>
        <div className="flex gap-2">
          {prevChapter && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/manga/${mangaId}/chapter/${prevChapter.id}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Önceki Bölüm
              </Link>
            </Button>
          )}
          {nextChapter && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/manga/${mangaId}/chapter/${nextChapter.id}`}>
                Sonraki Bölüm
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

