"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Maximize,
  Minimize,
  Settings,
  List,
  BookOpen,
  Bookmark,
  MessageSquare,
  Heart,
  ThumbsUp,
  Laugh,
  Angry,
  Frown,
  Share2,
  Eye,
  Clock,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import CommentSection from "@/components/comment-section"
import ChapterSEO from "@/components/seo/chapter-seo"
import Breadcrumbs from "@/components/breadcrumbs"
import { useSupabaseAuth } from "@/components/supabase-auth-provider"

interface ChapterReaderProps {
  params: {
    id: string
    chapter: string
  }
}

// This would come from an API in a real application
const getChapterPages = (mangaId: string, chapterNumber: string) => {
  if (typeof window !== "undefined") {
    try {
      const chapters = JSON.parse(localStorage.getItem("mangaChapters") || "[]")
      const chapter = chapters.find(
        (c: any) => c.mangaId.toString() === mangaId && c.chapterNumber.toString() === chapterNumber,
      )

      if (chapter && chapter.pageUrls) {
        return chapter.pageUrls.map((url: string, i: number) => ({
          id: i + 1,
          url: url,
        }))
      }
    } catch (error) {
      console.error("Error loading chapter pages:", error)
    }
  }

  // Generate 20 placeholder pages as fallback
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    url: `/placeholder.svg?height=1400&width=900&text=Page ${i + 1}`,
  }))
}

// This would come from an API in a real application
const getChapterInfo = (mangaId: string, chapterNumber: string) => {
  if (typeof window !== "undefined") {
    try {
      // Get chapter from localStorage
      const chapters = JSON.parse(localStorage.getItem("mangaChapters") || "[]")
      const chapter = chapters.find(
        (c: any) => c.mangaId.toString() === mangaId && c.chapterNumber.toString() === chapterNumber,
      )

      // Get manga title
      const mangaList = JSON.parse(localStorage.getItem("mangaList") || "[]")
      const manga = mangaList.find((m: any) => m.id.toString() === mangaId)
      const mangaTitle = manga ? manga.title : "One Piece" // Fallback title

      if (chapter) {
        // Get prev/next chapter numbers
        const sortedChapters = chapters
          .filter((c: any) => c.mangaId.toString() === mangaId)
          .map((c: any) => Number.parseInt(c.chapterNumber))
          .sort((a: number, b: number) => a - b)

        const currentIndex = sortedChapters.indexOf(Number.parseInt(chapterNumber))
        const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null
        const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null

        return {
          mangaId: Number.parseInt(mangaId),
          mangaTitle: mangaTitle,
          number: Number.parseInt(chapterNumber),
          title: chapter.title,
          date: chapter.uploadDate,
          views: chapter.views || 0,
          prevChapter: prevChapter,
          nextChapter: nextChapter,
        }
      }
    } catch (error) {
      console.error("Error loading chapter info:", error)
    }
  }

  // Fallback to default data
  return {
    mangaId: Number.parseInt(mangaId),
    mangaTitle: "One Piece",
    number: Number.parseInt(chapterNumber),
    title: "The Truth of the Empty Throne",
    date: "2023-03-10",
    views: 12543,
    prevChapter: Number.parseInt(chapterNumber) > 1 ? Number.parseInt(chapterNumber) - 1 : null,
    nextChapter: Number.parseInt(chapterNumber) < 1089 ? Number.parseInt(chapterNumber) + 1 : null,
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
    content: "This chapter was amazing! I can't believe what happened to Luffy!",
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
        content: "I know right? The plot twist was incredible!",
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
    content: "The art in this chapter is on another level. Oda-sensei never disappoints!",
    timestamp: "5 hours ago",
    likes: 17,
    isLiked: false,
    replies: [],
  },
]

// Emoji reaction options
const reactionEmojis = [
  { emoji: "❤️", label: "Love", icon: Heart, count: 128 },
  { emoji: "👍", label: "Like", icon: ThumbsUp, count: 85 },
  { emoji: "😂", label: "Haha", icon: Laugh, count: 42 },
  { emoji: "😢", label: "Sad", icon: Frown, count: 18 },
  { emoji: "😡", label: "Angry", icon: Angry, count: 7 },
]

export default function ChapterReader({ params }: ChapterReaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useSupabaseAuth()
  const commentSectionRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [readingMode, setReadingMode] = useState<"horizontal" | "vertical">("vertical")
  const [isLoading, setIsLoading] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const pages = getChapterPages(params.id, params.chapter)
  const chapterInfo = getChapterInfo(params.id, params.chapter)

  const totalPages = pages.length

  // Generate URLs for SEO
  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://mangaverse.example.com/manga/${params.id}/chapter/${params.chapter}`
  const prevChapterUrl = chapterInfo.prevChapter ? `/manga/${params.id}/chapter/${chapterInfo.prevChapter}` : undefined
  const nextChapterUrl = chapterInfo.nextChapter ? `/manga/${params.id}/chapter/${chapterInfo.nextChapter}` : undefined

  // Load user preferences
  useEffect(() => {
    if (user && user.preferences && user.preferences.readerMode) {
      setReadingMode(user.preferences.readerMode)
    }
  }, [user])

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true)
        })
        .catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
    } else {
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => {
            setIsFullscreen(false)
          })
          .catch((err) => {
            console.error(`Error attempting to exit fullscreen: ${err.message}`)
          })
      }
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "d") {
        if (currentPage < totalPages) {
          setCurrentPage((prev) => prev + 1)
        } else if (chapterInfo.nextChapter) {
          router.push(`/manga/${params.id}/chapter/${chapterInfo.nextChapter}`)
        }
      } else if (e.key === "ArrowLeft" || e.key === "a") {
        if (currentPage > 1) {
          setCurrentPage((prev) => prev - 1)
        } else if (chapterInfo.prevChapter) {
          router.push(`/manga/${params.id}/chapter/${chapterInfo.prevChapter}`)
        }
      } else if (e.key === "f") {
        toggleFullscreen()
      }
    },
    [currentPage, totalPages, chapterInfo, router, params.id],
  )

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  // Handle page navigation
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
      // Scroll to top when changing pages
      window.scrollTo(0, 0)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
      window.scrollTo(0, 0)
    } else if (chapterInfo.nextChapter) {
      router.push(`/manga/${params.id}/chapter/${chapterInfo.nextChapter}`)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
      window.scrollTo(0, 0)
    } else if (chapterInfo.prevChapter) {
      router.push(`/manga/${params.id}/chapter/${chapterInfo.prevChapter}`)
    }
  }

  const goToNextChapter = () => {
    if (chapterInfo.nextChapter) {
      router.push(`/manga/${params.id}/chapter/${chapterInfo.nextChapter}`)
    } else {
      toast({
        title: "Last Chapter",
        description: "You've reached the latest chapter",
      })
    }
  }

  const goToPrevChapter = () => {
    if (chapterInfo.prevChapter) {
      router.push(`/manga/${params.id}/chapter/${chapterInfo.prevChapter}`)
    } else {
      toast({
        title: "First Chapter",
        description: "This is the first chapter",
      })
    }
  }

  // Handle reactions
  const toggleReaction = (emoji: string) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }

    if (userReactions.includes(emoji)) {
      setUserReactions((prev) => prev.filter((e) => e !== emoji))
    } else {
      setUserReactions((prev) => [...prev, emoji])
    }
  }

  const scrollToComments = () => {
    setShowComments(true)
    setTimeout(() => {
      commentSectionRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  // Simulate image loading
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [currentPage])

  // Save reading progress
  useEffect(() => {
    // In a real app, you would save this to a database or localStorage
    localStorage.setItem(`reading-progress-${params.id}-${params.chapter}`, currentPage.toString())
  }, [currentPage, params.id, params.chapter])

  // Track page view for analytics
  useEffect(() => {
    // In a real app, you would send this to your analytics service
    console.log(`Viewing manga ${params.id}, chapter ${params.chapter}, page ${currentPage}`)

    // This would be your analytics tracking code
    if (typeof window !== "undefined") {
      // Example: Google Analytics page view tracking
      // window.gtag('event', 'page_view', {
      //   page_title: `${chapterInfo.mangaTitle} - Chapter ${chapterInfo.number}`,
      //   page_path: `/manga/${params.id}/chapter/${params.chapter}`,
      //   page_location: window.location.href
      // });
    }
  }, [params.id, params.chapter, currentPage, chapterInfo.mangaTitle, chapterInfo.number])

  return (
    <>
      <ChapterSEO
        manga={{ id: chapterInfo.mangaId, title: chapterInfo.mangaTitle }}
        chapter={{ number: chapterInfo.number, title: chapterInfo.title }}
        url={currentUrl}
        prevChapterUrl={prevChapterUrl}
        nextChapterUrl={nextChapterUrl}
      />

      <div className="min-h-screen flex flex-col bg-background">
        {/* Reader Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push(`/manga/${params.id}`)}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to manga</span>
              </Button>
              <div>
                <h1 className="text-sm font-medium line-clamp-1">{chapterInfo.mangaTitle}</h1>
                <p className="text-xs text-muted-foreground">
                  Chapter {chapterInfo.number}: {chapterInfo.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={scrollToComments}>
                      <MessageSquare className="h-5 w-5" />
                      <span className="sr-only">Comments</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Comments</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <List className="h-5 w-5" />
                    <span className="sr-only">Chapter list</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Chapters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-1">
                    {Array.from({ length: 10 }, (_, i) => {
                      const chapterNum = Number.parseInt(params.chapter) - i
                      if (chapterNum <= 0) return null
                      return (
                        <Button
                          key={chapterNum}
                          variant={chapterNum === Number.parseInt(params.chapter) ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => router.push(`/manga/${params.id}/chapter/${chapterNum}`)}
                        >
                          Chapter {chapterNum}
                        </Button>
                      )
                    })}
                  </div>
                </SheetContent>
              </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Reader Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setReadingMode("horizontal")}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Horizontal Mode</span>
                    {readingMode === "horizontal" && <span className="ml-auto text-xs">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setReadingMode("vertical")}>
                    <BookOpen className="mr-2 h-4 w-4 rotate-90" />
                    <span>Vertical Mode</span>
                    {readingMode === "vertical" && <span className="ml-auto text-xs">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={toggleFullscreen}>
                    {isFullscreen ? (
                      <>
                        <Minimize className="mr-2 h-4 w-4" />
                        <span>Exit Fullscreen</span>
                      </>
                    ) : (
                      <>
                        <Maximize className="mr-2 h-4 w-4" />
                        <span>Enter Fullscreen</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>Bookmark Chapter</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Share</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="container py-2">
          <Breadcrumbs
            items={[
              { label: "Manga", href: "/manga" },
              { label: chapterInfo.mangaTitle, href: `/manga/${params.id}` },
              {
                label: `Chapter ${chapterInfo.number}`,
                href: `/manga/${params.id}/chapter/${params.chapter}`,
                isCurrent: true,
              },
            ]}
          />
        </div>

        {/* Chapter Info Banner */}
        <div className="bg-muted/30 py-3 px-4 border-b">
          <div className="container flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>{chapterInfo.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Updated {chapterInfo.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPrevChapter} disabled={!chapterInfo.prevChapter}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Prev Chapter
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextChapter} disabled={!chapterInfo.nextChapter}>
                Next Chapter
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Reader Content */}
        <main className="flex-1 flex flex-col items-center">
          {readingMode === "horizontal" ? (
            <div className="relative w-full max-w-4xl mx-auto flex items-center justify-center py-4">
              {isLoading ? (
                <div className="w-full aspect-[2/3] max-w-lg bg-muted animate-pulse rounded-md"></div>
              ) : (
                <div className="relative w-full max-w-lg mx-auto">
                  <Image
                    src={pages[currentPage - 1].url || "/placeholder.svg"}
                    alt={`${chapterInfo.mangaTitle} Chapter ${chapterInfo.number} Page ${currentPage}`}
                    width={900}
                    height={1400}
                    className="w-full h-auto rounded-md shadow-md"
                    priority
                  />

                  {/* Page number indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    {currentPage} / {totalPages}
                  </div>

                  {/* Navigation overlay */}
                  <div className="absolute inset-0 flex">
                    <div className="w-1/3 h-full cursor-pointer" onClick={goToPrevPage} title="Previous page" />
                    <div className="w-1/3 h-full cursor-pointer" onClick={toggleFullscreen} title="Toggle fullscreen" />
                    <div className="w-1/3 h-full cursor-pointer" onClick={goToNextPage} title="Next page" />
                  </div>
                </div>
              )}

              {/* Side navigation buttons */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/50 backdrop-blur"
                onClick={goToPrevPage}
                disabled={currentPage === 1 && !chapterInfo.prevChapter}
              >
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Previous page</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/50 backdrop-blur"
                onClick={goToNextPage}
                disabled={currentPage === totalPages && !chapterInfo.nextChapter}
              >
                <ChevronRight className="h-6 w-6" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto py-4 space-y-4">
              {pages.map((page, index) => (
                <div key={page.id} id={`page-${page.id}`} className="w-full flex justify-center relative">
                  <Image
                    src={page.url || "/placeholder.svg"}
                    alt={`${chapterInfo.mangaTitle} Chapter ${chapterInfo.number} Page ${page.id}`}
                    width={900}
                    height={1400}
                    className="w-full max-w-lg h-auto rounded-md shadow-md"
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                  />

                  {/* Page number indicator */}
                  <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    {page.id} / {totalPages}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Page navigation buttons (for vertical mode) */}
          {readingMode === "vertical" && (
            <div className="container flex justify-center gap-4 my-6">
              <Button
                variant="outline"
                onClick={goToPrevChapter}
                disabled={!chapterInfo.prevChapter}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Chapter
              </Button>
              <Button
                variant="outline"
                onClick={goToNextChapter}
                disabled={!chapterInfo.nextChapter}
                className="flex items-center gap-2"
              >
                Next Chapter
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Reactions and Comments Section */}
          <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
            {/* Reactions */}
            <div className="bg-muted/20 rounded-lg p-4 border">
              <h3 className="text-lg font-medium mb-4">Reader Reactions</h3>
              <div className="flex flex-wrap gap-4">
                {reactionEmojis.map((reaction) => {
                  const isSelected = userReactions.includes(reaction.emoji)
                  return (
                    <button
                      key={reaction.emoji}
                      onClick={() => toggleReaction(reaction.emoji)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                        isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted"
                      }`}
                    >
                      <span className="text-xl">{reaction.emoji}</span>
                      <span className="font-medium">{isSelected ? reaction.count + 1 : reaction.count}</span>
                    </button>
                  )
                })}
              </div>

              {showLoginPrompt && !isAuthenticated && (
                <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                  Please{" "}
                  <Link href="/login" className="text-primary font-medium">
                    log in
                  </Link>{" "}
                  to react to this chapter.
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div ref={commentSectionRef} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Comments</h3>
                <Button variant="outline" size="sm" onClick={() => setShowComments(!showComments)}>
                  {showComments ? "Hide Comments" : "Show Comments"}
                </Button>
              </div>

              {showComments && (
                <CommentSection
                  initialComments={sampleComments}
                  contentType="chapter"
                  contentId={`${params.id}-${params.chapter}`}
                />
              )}
            </div>
          </div>
        </main>

        {/* Reader Footer */}
        {readingMode === "horizontal" && (
          <footer className="sticky bottom-0 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
              <Button variant="outline" size="sm" onClick={goToPrevChapter} disabled={!chapterInfo.prevChapter}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Prev Chapter
              </Button>

              <div className="flex-1 mx-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-12 text-right">{currentPage}</span>
                <Slider
                  value={[currentPage]}
                  min={1}
                  max={totalPages}
                  step={1}
                  className="flex-1"
                  onValueChange={(value) => goToPage(value[0])}
                />
                <span className="text-sm text-muted-foreground w-12">{totalPages}</span>
              </div>

              <Button variant="outline" size="sm" onClick={goToNextChapter} disabled={!chapterInfo.nextChapter}>
                Next Chapter
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </footer>
        )}

        {/* Quick Navigation Buttons (Fixed) */}
        {readingMode === "horizontal" && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="fixed left-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg opacity-80 hover:opacity-100"
              onClick={goToPrevPage}
              disabled={currentPage === 1 && !chapterInfo.prevChapter}
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Previous page</span>
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="fixed right-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg opacity-80 hover:opacity-100"
              onClick={goToNextPage}
              disabled={currentPage === totalPages && !chapterInfo.nextChapter}
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next page</span>
            </Button>
          </>
        )}
      </div>
    </>
  )
}

