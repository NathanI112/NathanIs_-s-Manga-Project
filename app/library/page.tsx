"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Heart, Clock, Search, X, AlertTriangle } from "lucide-react"
import { useSupabaseAuth } from "@/components/supabase-auth-provider"
import Header from "@/components/header"

// Manga türleri
const mangaTypes = [
  { id: "reading", label: "Reading", icon: <BookOpen className="h-4 w-4" /> },
  { id: "completed", label: "Completed", icon: <Badge className="h-4 w-4" /> },
  { id: "on_hold", label: "On Hold", icon: <Clock className="h-4 w-4" /> },
  { id: "dropped", label: "Dropped", icon: <X className="h-4 w-4" /> },
  { id: "plan_to_read", label: "Plan to Read", icon: <BookOpen className="h-4 w-4" /> },
  { id: "favorites", label: "Favorites", icon: <Heart className="h-4 w-4" /> },
]

// Örnek manga verileri
const mockLibrary = [
  {
    id: 1,
    title: "One Piece",
    cover: "/placeholder.svg?height=400&width=300",
    progress: 1089,
    total: 1089,
    lastRead: "2023-03-15",
    status: "reading",
    isFavorite: true,
    genres: ["Action", "Adventure", "Fantasy"],
    rating: 5,
  },
  {
    id: 2,
    title: "Demon Slayer",
    cover: "/placeholder.svg?height=400&width=300",
    progress: 180,
    total: 205,
    lastRead: "2023-03-10",
    status: "reading",
    isFavorite: true,
    genres: ["Action", "Supernatural"],
    rating: 4,
  },
  {
    id: 3,
    title: "Jujutsu Kaisen",
    cover: "/placeholder.svg?height=400&width=300",
    progress: 223,
    total: 223,
    lastRead: "2023-03-14",
    status: "completed",
    isFavorite: true,
    genres: ["Action", "Supernatural", "Horror"],
    rating: 5,
  },
  {
    id: 4,
    title: "My Hero Academia",
    cover: "/placeholder.svg?height=400&width=300",
    progress: 350,
    total: 420,
    lastRead: "2023-02-20",
    status: "reading",
    isFavorite: false,
    genres: ["Action", "Superhero"],
    rating: 4,
  },
  {
    id: 5,
    title: "Attack on Titan",
    cover: "/placeholder.svg?height=400&width=300",
    progress: 139,
    total: 139,
    lastRead: "2022-12-10",
    status: "completed",
    isFavorite: true,
    genres: ["Action", "Dark Fantasy", "Post-Apocalyptic"],
    rating: 5,
  },
  {
    id: 6,
    title: "Chainsaw Man",
    cover: "/placeholder.svg?height=400&width=300",
    progress: 120,
    total: 120,
    lastRead: "2023-01-05",
    status: "on_hold",
    isFavorite: false,
    genres: ["Action", "Dark Fantasy", "Horror"],
    rating: 4,
  },
  {
    id: 7,
    title: "Spy x Family",
    cover: "/placeholder.svg?height=400&width=300",
    progress: 0,
    total: 80,
    lastRead: null,
    status: "plan_to_read",
    isFavorite: false,
    genres: ["Action", "Comedy", "Spy"],
    rating: 0,
  },
  {
    id: 8,
    title: "Tokyo Ghoul",
    cover: "/placeholder.svg?height=400&width=300",
    progress: 143,
    total: 143,
    lastRead: "2022-10-15",
    status: "completed",
    isFavorite: false,
    genres: ["Action", "Horror", "Supernatural"],
    rating: 4,
  },
  {
    id: 9,
    title: "Bleach",
    cover: "/placeholder.svg?height=400&width=300",
    progress: 200,
    total: 686,
    lastRead: "2022-09-20",
    status: "dropped",
    isFavorite: false,
    genres: ["Action", "Adventure", "Supernatural"],
    rating: 3,
  },
  {
    id: 10,
    title: "Naruto",
    cover: "/placeholder.svg?height=400&width=300",
    progress: 700,
    total: 700,
    lastRead: "2022-08-10",
    status: "completed",
    isFavorite: true,
    genres: ["Action", "Adventure", "Martial Arts"],
    rating: 5,
  },
]

export default function LibraryPage() {
  const router = useRouter()
  const { user } = useSupabaseAuth()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("last_read")
  const [library, setLibrary] = useState(mockLibrary)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    if (!user) {
      router.push("/login?redirect=/library")
      return
    }

    // Gerçek uygulamada burada API'den kullanıcının kütüphanesini çekeriz
    // Şimdilik mock veriyi kullanıyoruz
    setIsLoading(false)
  }, [user, router])

  // Filtreleme fonksiyonu
  const filteredLibrary = library.filter((manga) => {
    // Arama sorgusuna göre filtrele
    if (searchQuery && !manga.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Sekme seçimine göre filtrele
    if (activeTab === "all") {
      return true
    } else if (activeTab === "favorites") {
      return manga.isFavorite
    } else {
      return manga.status === activeTab
    }
  })

  // Sıralama fonksiyonu
  const sortedLibrary = [...filteredLibrary].sort((a, b) => {
    switch (sortBy) {
      case "title_asc":
        return a.title.localeCompare(b.title)
      case "title_desc":
        return b.title.localeCompare(a.title)
      case "progress":
        return b.progress / b.total - a.progress / a.total
      case "rating":
        return b.rating - a.rating
      case "last_read":
      default:
        // Null lastRead değerleri en sona
        if (!a.lastRead) return 1
        if (!b.lastRead) return -1
        return new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime()
    }
  })

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container py-8 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">My Library</h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search manga..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_read">Last Read</SelectItem>
                <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                <SelectItem value="title_desc">Title (Z-A)</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto p-1">
            <TabsTrigger value="all" className="flex-grow">
              All
            </TabsTrigger>
            {mangaTypes.map((type) => (
              <TabsTrigger key={type.id} value={type.id} className="flex-grow">
                <span className="flex items-center gap-1">
                  {type.icon}
                  <span className="hidden sm:inline">{type.label}</span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tüm sekmeler için aynı içerik, filtreleme JS ile yapılıyor */}
          <TabsContent value={activeTab} className="mt-6">
            {sortedLibrary.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No manga found</h2>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "No manga matches your search criteria."
                    : activeTab === "all"
                      ? "Your library is empty. Start adding manga to your collection!"
                      : `You don't have any manga in your "${mangaTypes.find((t) => t.id === activeTab)?.label || activeTab}" list.`}
                </p>
                <Button asChild>
                  <Link href="/popular">Browse Popular Manga</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedLibrary.map((manga) => (
                  <Card key={manga.id} className="overflow-hidden h-full flex flex-col">
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      <Link href={`/manga/${manga.id}`}>
                        <Image
                          src={manga.cover || "/placeholder.svg"}
                          alt={manga.title}
                          fill
                          className="object-cover transition-transform hover:scale-105"
                        />
                      </Link>
                      {manga.isFavorite && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full">
                          <Heart className="h-4 w-4 fill-current" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <div className="flex-1">
                        <Link href={`/manga/${manga.id}`} className="hover:underline">
                          <h3 className="font-semibold line-clamp-1">{manga.title}</h3>
                        </Link>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {manga.genres.slice(0, 2).map((genre) => (
                            <Badge key={genre} variant="secondary" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                          {manga.genres.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{manga.genres.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {manga.progress}/{manga.total}
                          </span>
                        </div>
                        <Progress value={manga.total ? (manga.progress / manga.total) * 100 : 0} className="h-2" />

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                          <span className="flex items-center">
                            <Badge className={`h-2 w-2 mr-1 rounded-full ${getStatusColor(manga.status)}`} />
                            {getStatusLabel(manga.status)}
                          </span>
                          {manga.lastRead && <span>Last read: {formatDate(manga.lastRead)}</span>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

// Yardımcı fonksiyonlar
function getStatusLabel(status) {
  const labels = {
    reading: "Reading",
    completed: "Completed",
    on_hold: "On Hold",
    dropped: "Dropped",
    plan_to_read: "Plan to Read",
  }
  return labels[status] || status
}

function getStatusColor(status) {
  const colors = {
    reading: "bg-green-500",
    completed: "bg-blue-500",
    on_hold: "bg-yellow-500",
    dropped: "bg-red-500",
    plan_to_read: "bg-purple-500",
  }
  return colors[status] || "bg-gray-500"
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`

  return date.toLocaleDateString()
}

