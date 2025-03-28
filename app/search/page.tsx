"use client"

import type React from "react"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import MangaGrid from "@/components/manga-grid"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true)

      if (!query) {
        setResults([])
        setIsLoading(false)
        return
      }

      try {
        // Önce API'den manga listesini almayı deneyelim
        const response = await fetch("/api/manga")

        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${await response.text()}`)
        }

        const data = await response.json()
        let mangaList = Array.isArray(data) ? data : []

        // API'den veri gelmezse localStorage'dan almayı deneyelim
        if (mangaList.length === 0) {
          try {
            const savedManga = JSON.parse(localStorage.getItem("mangaList") || "[]")
            if (Array.isArray(savedManga) && savedManga.length > 0) {
              mangaList = savedManga
            }
          } catch (error) {
            console.error("Error parsing mangaList from localStorage:", error)
          }
        }

        // Örnek veri ekleyelim (gerçek uygulamada kaldırılabilir)
        if (mangaList.length === 0) {
          mangaList = [
            {
              id: 1,
              title: "One Piece",
              alternativeTitles: "ワンピース",
              author: "Eiichiro Oda",
              description: "Follows the adventures of Monkey D. Luffy and his pirate crew.",
              genres: ["Action", "Adventure", "Comedy", "Fantasy"],
              cover: "/placeholder.svg?height=400&width=300&text=One+Piece",
              rating: 4.9,
              chapters: [{ number: 1 }, { number: 2 }, { number: 1084 }],
              createdAt: new Date().toISOString(),
            },
            {
              id: 2,
              title: "Naruto",
              alternativeTitles: "ナルト",
              author: "Masashi Kishimoto",
              description: "The story of Naruto Uzumaki, a young ninja.",
              genres: ["Action", "Adventure", "Fantasy"],
              cover: "/placeholder.svg?height=400&width=300&text=Naruto",
              rating: 4.7,
              chapters: [{ number: 1 }, { number: 2 }, { number: 700 }],
              createdAt: new Date().toISOString(),
            },
            {
              id: 3,
              title: "Attack on Titan",
              alternativeTitles: "進撃の巨人, Shingeki no Kyojin",
              author: "Hajime Isayama",
              description: "The story follows Eren Yeager, who vows to exterminate the Titans.",
              genres: ["Action", "Drama", "Fantasy", "Horror"],
              cover: "/placeholder.svg?height=400&width=300&text=Attack+on+Titan",
              rating: 4.8,
              chapters: [{ number: 1 }, { number: 2 }, { number: 139 }],
              createdAt: new Date().toISOString(),
            },
          ]

          // Örnek verileri localStorage'a kaydedelim
          localStorage.setItem("mangaList", JSON.stringify(mangaList))
        }

        // Arama sorgusuna göre filtreleme yapalım
        const searchLower = query.toLowerCase()
        const filteredManga = mangaList.filter(
          (manga: any) =>
            (manga.title && manga.title.toLowerCase().includes(searchLower)) ||
            (manga.alternativeTitles && manga.alternativeTitles.toLowerCase().includes(searchLower)) ||
            (manga.author && manga.author.toLowerCase().includes(searchLower)) ||
            (manga.description && manga.description.toLowerCase().includes(searchLower)) ||
            (manga.genres && manga.genres.some((genre: string) => genre.toLowerCase().includes(searchLower))),
        )

        console.log("Search results:", filteredManga)

        // Görüntüleme için formatla
        const formattedResults = filteredManga.map((manga: any) => {
          // En son bölüm numarasını al
          let latestChapter = 1
          if (manga.chapters && manga.chapters.length > 0) {
            const chapterNumbers = manga.chapters
              .map((c: any) => (typeof c.number === "number" ? c.number : Number.parseInt(c.number)))
              .filter((n: number) => !isNaN(n))

            if (chapterNumbers.length > 0) {
              latestChapter = Math.max(...chapterNumbers)
            }
          }

          return {
            id: manga.id,
            title: manga.title,
            cover: manga.cover || "/placeholder.svg?height=400&width=300",
            rating: manga.rating || 4.5,
            latestChapter: latestChapter,
            isNew: new Date(manga.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
            genres: manga.genres,
          }
        })

        setResults(formattedResults)
      } catch (error) {
        console.error("Error searching manga:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Arama sorgusuyla URL'yi güncelle
    const url = searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : "/search"
    window.history.pushState({}, "", url)
    window.dispatchEvent(new Event("popstate"))

    // Yeni sorguyla aramanın gerçekleştirilmesi için sayfayı yeniden yükle
    window.location.href = url
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Arama Sonuçları</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Manga ara..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit">Ara</Button>
      </form>

      {query && (
        <p className="text-muted-foreground mb-4">
          {isLoading ? "Aranıyor..." : `"${query}" için ${results.length} sonuç bulundu`}
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden h-full">
              <div className="relative aspect-[3/4] w-full bg-muted animate-pulse"></div>
              <CardContent className="p-3">
                <div className="h-5 bg-muted animate-pulse rounded-md"></div>
                <div className="h-3 mt-2 bg-muted animate-pulse rounded-md w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : results.length > 0 ? (
        <MangaGrid manga={results} />
      ) : (
        <div className="text-center py-12">
          {query ? (
            <div>
              <p className="text-xl font-medium mb-2">Sonuç bulunamadı</p>
              <p className="text-muted-foreground">"{query}" ile eşleşen manga bulamadık</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Manga aramak için bir arama terimi girin</p>
          )}
        </div>
      )}
    </div>
  )
}

