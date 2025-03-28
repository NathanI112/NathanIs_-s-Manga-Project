"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Bookmark, BookmarkCheck, Star, MessageSquare, Share2, Heart } from "lucide-react"
import CommentSection from "@/components/comment-section"
import MangaSEO from "@/components/seo/manga-seo"
import Breadcrumbs from "@/components/breadcrumbs"

interface MangaPageProps {
  params: {
    id: string
  }
}

// Sample comments
const sampleComments = [
  {
    id: 1,
    user: {
      name: "MangaFan123",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "This manga is amazing! I've been following it for years and it never disappoints.",
    timestamp: "2 hours ago",
    likes: 24,
    isLiked: false,
    replies: [
      {
        id: 101,
        user: {
          name: "OnePieceLover",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content: "I know right? The latest arc is incredible!",
        timestamp: "1 hour ago",
        likes: 8,
        isLiked: false,
      },
    ],
  },
  {
    id: 2,
    user: {
      name: "MangaReader42",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "The art in this manga is on another level. Oda-sensei never disappoints!",
    timestamp: "5 hours ago",
    likes: 17,
    isLiked: false,
    replies: [],
  },
]

export default function MangaPage({ params }: MangaPageProps) {
  const [manga, setManga] = useState<any>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState("chapters")
  const [allChapters, setAllChapters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const currentUrl =
    typeof window !== "undefined" ? window.location.href : `https://mangaverse.example.com/manga/${params.id}`

  // Load manga and chapters
  useEffect(() => {
    const loadMangaAndChapters = () => {
      setIsLoading(true)

      // Get manga from localStorage
      let mangaData = null
      try {
        const mangaList = JSON.parse(localStorage.getItem("mangaList") || "[]")
        mangaData = mangaList.find((m: any) => m.id.toString() === params.id)
      } catch (error) {
        console.error("Error loading manga:", error)
      }

      // If not found in localStorage, use default data
      if (!mangaData) {
        mangaData = {
          id: Number.parseInt(params.id),
          title: "One Piece",
          cover: "/placeholder.svg?height=600&width=400",
          banner: "/placeholder.svg?height=400&width=1200",
          description:
            "Gol D. Roger was known as the 'Pirate King,' the strongest and most infamous being to have sailed the Grand Line. The capture and execution of Roger by the World Government brought a change throughout the world. His last words before his death revealed the existence of the greatest treasure in the world, One Piece. It was this revelation that brought about the Grand Age of Pirates, men who dreamed of finding One Piece—which promises an unlimited amount of riches and fame—and quite possibly the pinnacle of glory and the title of the Pirate King.",
          author: "Eiichiro Oda",
          artist: "Eiichiro Oda",
          status: "Ongoing",
          releaseYear: 1999,
          rating: 4.9,
          genres: ["Action", "Adventure", "Comedy", "Fantasy", "Shounen", "Super Power"],
          chapters: [
            { number: 1089, title: "The Truth of the Empty Throne", date: "2023-03-10", views: 1250000 },
            { number: 1088, title: "Luffy's Dream", date: "2023-03-03", views: 1200000 },
            { number: 1087, title: "The Will of Ohara", date: "2023-02-24", views: 1180000 },
            { number: 1086, title: "A New Emperor", date: "2023-02-17", views: 1150000 },
            { number: 1085, title: "The Final Road Poneglyph", date: "2023-02-10", views: 1100000 },
          ],
          related: [
            { id: 2, title: "Naruto", cover: "/placeholder.svg?height=400&width=300" },
            { id: 3, title: "Bleach", cover: "/placeholder.svg?height=400&width=300" },
            { id: 4, title: "Dragon Ball", cover: "/placeholder.svg?height=400&width=300" },
            { id: 5, title: "My Hero Academia", cover: "/placeholder.svg?height=400&width=300" },
          ],
        }
      }

      setManga(mangaData)

      // Get chapters from manga
      const mangaChapters = mangaData.chapters || []

      // Get chapters from mangaChapters in localStorage
      let additionalChapters = []
      try {
        const allChapters = JSON.parse(localStorage.getItem("mangaChapters") || "[]")
        additionalChapters = allChapters
          .filter((chapter: any) => chapter.mangaId.toString() === params.id)
          .map((chapter: any) => ({
            number: Number.parseInt(chapter.chapterNumber),
            title: chapter.title,
            date: chapter.uploadDate,
            views: chapter.views || 0,
          }))
      } catch (error) {
        console.error("Error loading chapters:", error)
      }

      console.log("Manga chapters:", mangaChapters)
      console.log("Additional chapters:", additionalChapters)

      // Combine and sort all chapters
      const combinedChapters = [...mangaChapters, ...additionalChapters].sort((a, b) => b.number - a.number)

      // Remove duplicates
      const uniqueChapters = combinedChapters.filter(
        (chapter, index, self) => index === self.findIndex((c) => c.number === chapter.number),
      )

      setAllChapters(uniqueChapters)
      setIsLoading(false)
    }

    loadMangaAndChapters()

    // Add event listener for storage changes
    window.addEventListener("storage", loadMangaAndChapters)

    return () => {
      window.removeEventListener("storage", loadMangaAndChapters)
    }
  }, [params.id])

  if (isLoading || !manga) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <MangaSEO manga={manga} url={currentUrl} />

      <div className="min-h-screen">
        <div className="relative h-[300px] w-full overflow-hidden">
          <Image
            src={manga.banner || "/placeholder.svg"}
            alt={`${manga.title} banner`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="container relative -mt-32 z-10">
          <Breadcrumbs
            items={[
              { label: "Manga", href: "/manga" },
              { label: manga.title, href: `/manga/${manga.id}`, isCurrent: true },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 lg:gap-10">
            <div className="space-y-4">
              <div className="relative aspect-[2/3] w-full max-w-[250px] mx-auto md:mx-0 overflow-hidden rounded-lg shadow-xl">
                <Image
                  src={manga.cover || "/placeholder.svg"}
                  alt={manga.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 250px"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button className="w-full flex items-center gap-2" onClick={() => setIsBookmarked(!isBookmarked)}>
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck className="h-4 w-4" />
                      <span>Bookmarked</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" />
                      <span>Add to Library</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-destructive text-destructive" : ""}`} />
                  <span>{isLiked ? "Liked" : "Like"}</span>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="icon" onClick={() => setActiveTab("comments")}>
                    <MessageSquare className="h-4 w-4" />
                    <span className="sr-only">Comments</span>
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{manga.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="ml-1 text-sm font-medium">{manga.rating}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{manga.status}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{manga.releaseYear}</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {manga.genres &&
                    manga.genres.map((genre: string) => (
                      <Link key={genre} href={`/genres/${genre.toLowerCase()}`}>
                        <Badge variant="secondary">{genre}</Badge>
                      </Link>
                    ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
                <p className="text-muted-foreground">{manga.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Author</h3>
                  <p>{manga.author}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Artist</h3>
                  <p>{manga.artist}</p>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="chapters">Chapters</TabsTrigger>
                  <TabsTrigger value="related">Related Manga</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                </TabsList>

                <TabsContent value="chapters" className="mt-4">
                  {allChapters.length > 0 ? (
                    <div className="space-y-2">
                      {allChapters.map((chapter) => (
                        <Link key={chapter.number} href={`/manga/${manga.id}/chapter/${chapter.number}`}>
                          <Card className="hover:bg-muted/50 transition-colors">
                            <CardContent className="p-4 flex justify-between items-center">
                              <div>
                                <div className="font-medium">
                                  Chapter {chapter.number}: {chapter.title}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {chapter.date} • {chapter.views.toLocaleString()} views
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                Read
                              </Button>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No chapters available yet. Check back soon!
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="related" className="mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {manga.related &&
                      manga.related.map((item: any) => (
                        <Link key={item.id} href={`/manga/${item.id}`}>
                          <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                            <div className="relative aspect-[3/4] w-full overflow-hidden">
                              <Image
                                src={item.cover || "/placeholder.svg"}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform hover:scale-105"
                                sizes="(max-width: 768px) 50vw, 25vw"
                              />
                            </div>
                            <CardContent className="p-3">
                              <h3 className="font-medium line-clamp-1">{item.title}</h3>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="mt-4">
                  <CommentSection initialComments={sampleComments} contentType="manga" contentId={manga.id} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

