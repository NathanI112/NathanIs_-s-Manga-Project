"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Star } from "lucide-react"

interface MangaItem {
  id: number
  title: string
  cover: string
  rating: number
  latestChapter: number
  isNew: boolean
  genres?: string[]
}

interface MangaGridProps {
  limit?: number
  manga?: MangaItem[]
}

export default function MangaGrid({ limit, manga }: MangaGridProps) {
  const [displayedManga, setDisplayedManga] = useState<MangaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadManga = async () => {
      setIsLoading(true)

      // If manga prop is provided, use it directly
      if (manga) {
        setDisplayedManga(limit ? manga.slice(0, limit) : manga)
        setIsLoading(false)
        return
      }

      try {
        // Fetch manga from API
        const response = await fetch("/api/manga")
        if (!response.ok) {
          throw new Error("Failed to fetch manga")
        }

        const responseData = await response.json()
        // Check if the response has a data property (API might return { data: [...] })
        const mangaData = responseData.data || responseData

        // Ensure mangaData is an array
        if (!Array.isArray(mangaData)) {
          console.error("Expected manga data to be an array but got:", mangaData)
          setDisplayedManga([])
          setIsLoading(false)
          return
        }

        // Get chapters for each manga to determine latest chapter
        const mangaWithChapters = await Promise.all(
          mangaData.map(async (manga: any) => {
            try {
              const chaptersResponse = await fetch(`/api/chapters/manga/${manga.id}`)
              if (!chaptersResponse.ok) {
                return {
                  ...manga,
                  latestChapter: 1,
                  isNew: new Date(manga.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
                }
              }

              const chapters = await chaptersResponse.json()

              // Get latest chapter number
              let latestChapter = 1
              if (chapters && chapters.length > 0) {
                const chapterNumbers = chapters
                  .map((c: any) => Number(c.chapterNumber || c.number))
                  .filter((n: number) => !isNaN(n))

                if (chapterNumbers.length > 0) {
                  latestChapter = Math.max(...chapterNumbers)
                }
              }

              return {
                ...manga,
                latestChapter,
                isNew: new Date(manga.createdAt || manga.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
              }
            } catch (error) {
              console.error(`Error fetching chapters for manga ${manga.id}:`, error)
              return {
                ...manga,
                latestChapter: 1,
                isNew: new Date(manga.createdAt || manga.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
              }
            }
          }),
        )

        setDisplayedManga(limit ? mangaWithChapters.slice(0, limit) : mangaWithChapters)
      } catch (error) {
        console.error("Error loading manga for grid:", error)
        setDisplayedManga([])
      } finally {
        setIsLoading(false)
      }
    }

    loadManga()
  }, [limit, manga])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
        {[...Array(limit || 6)].map((_, i) => (
          <Card key={i} className="overflow-hidden h-full">
            <div className="relative aspect-[3/4] w-full bg-muted animate-pulse"></div>
            <CardContent className="p-2 sm:p-3">
              <div className="h-4 bg-muted animate-pulse rounded-md"></div>
              <div className="h-3 mt-2 bg-muted animate-pulse rounded-md w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (displayedManga.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl font-medium mb-2">No manga found</p>
        <p className="text-muted-foreground">Try adding some manga from the admin panel</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
      {displayedManga.map((item) => (
        <Link key={item.id} href={`/manga/${item.id}`}>
          <Card className="overflow-hidden h-full transition-all hover:shadow-md">
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <Image
                src={item.cover || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover transition-transform hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
              />
              {item.isNew && (
                <Badge className="absolute top-2 right-2" variant="secondary">
                  New
                </Badge>
              )}
            </div>
            <CardContent className="p-2 sm:p-3">
              <h3 className="font-medium text-sm sm:text-base line-clamp-1">{item.title}</h3>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-xs">{item.rating}</span>
              </div>
            </CardContent>
            <CardFooter className="p-2 sm:p-3 pt-0">
              <p className="text-xs text-muted-foreground">Ch. {item.latestChapter}</p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}

