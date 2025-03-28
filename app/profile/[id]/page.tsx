"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookOpen, MessageSquare, Heart, Calendar, Clock, Settings, Mail } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Header from "@/components/header"

export default function ProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("library")
  const isOwnProfile = currentUser?.id === userId

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate it with localStorage or mock data

        // Check if it's the current user
        if (currentUser && currentUser.id === userId) {
          setUser({
            id: currentUser.id,
            username: currentUser.username,
            email: currentUser.email,
            avatar: currentUser.avatar,
            createdAt: currentUser.createdAt,
            bio: "Manga enthusiast and avid reader. I love fantasy and action genres!",
            favoriteGenres: ["Action", "Adventure", "Fantasy", "Romance"],
            library: [
              {
                id: 1,
                title: "One Piece",
                cover: "/placeholder.svg?height=400&width=300",
                progress: 1089,
                total: 1089,
              },
              {
                id: 2,
                title: "Demon Slayer",
                cover: "/placeholder.svg?height=400&width=300",
                progress: 180,
                total: 205,
              },
              {
                id: 3,
                title: "Jujutsu Kaisen",
                cover: "/placeholder.svg?height=400&width=300",
                progress: 223,
                total: 223,
              },
            ],
            recentActivity: [
              { type: "read", manga: "One Piece", chapter: 1089, date: "2023-03-15" },
              { type: "comment", manga: "Jujutsu Kaisen", chapter: 223, date: "2023-03-14" },
              { type: "favorite", manga: "Demon Slayer", date: "2023-03-10" },
            ],
            stats: {
              chaptersRead: 1492,
              commentsPosted: 87,
              favoriteManga: 24,
            },
          })
        } else {
          // Mock data for other users
          setUser({
            id: userId,
            username: userId === "user-123" ? "MangaFan123" : `User-${userId}`,
            avatar: "/placeholder.svg?height=200&width=200",
            createdAt: "2023-01-15T00:00:00Z",
            bio: "Manga enthusiast and avid reader. I love fantasy and action genres!",
            favoriteGenres: ["Action", "Adventure", "Fantasy", "Romance"],
            library: [
              {
                id: 1,
                title: "One Piece",
                cover: "/placeholder.svg?height=400&width=300",
                progress: 1089,
                total: 1089,
              },
              {
                id: 2,
                title: "Demon Slayer",
                cover: "/placeholder.svg?height=400&width=300",
                progress: 180,
                total: 205,
              },
              {
                id: 3,
                title: "Jujutsu Kaisen",
                cover: "/placeholder.svg?height=400&width=300",
                progress: 223,
                total: 223,
              },
            ],
            recentActivity: [
              { type: "read", manga: "One Piece", chapter: 1089, date: "2023-03-15" },
              { type: "comment", manga: "Jujutsu Kaisen", chapter: 223, date: "2023-03-14" },
              { type: "favorite", manga: "Demon Slayer", date: "2023-03-10" },
            ],
            stats: {
              chaptersRead: 1492,
              commentsPosted: 87,
              favoriteManga: 24,
            },
          })
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [userId, currentUser])

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

  if (!user) {
    return (
      <>
        <Header />
        <div className="container py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
            <p className="text-muted-foreground">The user you're looking for doesn't exist or has been removed.</p>
            <Button asChild className="mt-4">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          {/* Profile Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>

                  {isOwnProfile && (
                    <div className="flex gap-2 mt-4 w-full">
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/settings">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{user.bio}</p>

                {isOwnProfile && user.email && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{user.stats.chaptersRead}</p>
                    <p className="text-xs text-muted-foreground">Chapters Read</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{user.stats.commentsPosted}</p>
                    <p className="text-xs text-muted-foreground">Comments</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{user.stats.favoriteManga}</p>
                    <p className="text-xs text-muted-foreground">Favorites</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Favorite Genres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.favoriteGenres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="library">Library</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>

              <TabsContent value="library" className="mt-6">
                <h2 className="text-xl font-bold mb-4">My Library</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {user.library.map((manga) => (
                    <Link key={manga.id} href={`/manga/${manga.id}`}>
                      <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                        <div className="relative aspect-[3/4] w-full overflow-hidden">
                          <Image
                            src={manga.cover || "/placeholder.svg"}
                            alt={manga.title}
                            fill
                            className="object-cover transition-transform hover:scale-105"
                          />
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium line-clamp-1">{manga.title}</h3>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">
                              {manga.progress}/{manga.total}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {Math.round((manga.progress / manga.total) * 100)}%
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {user.recentActivity.map((activity, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          {activity.type === "read" && <BookOpen className="h-4 w-4 text-primary" />}
                          {activity.type === "comment" && <MessageSquare className="h-4 w-4 text-primary" />}
                          {activity.type === "favorite" && <Heart className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {activity.type === "read" && `Read chapter ${activity.chapter} of ${activity.manga}`}
                            {activity.type === "comment" &&
                              `Commented on ${activity.manga} chapter ${activity.chapter}`}
                            {activity.type === "favorite" && `Added ${activity.manga} to favorites`}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{activity.date}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <h2 className="text-xl font-bold mb-4">Comments</h2>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Link href="/manga/1" className="font-medium hover:underline">
                          One Piece
                        </Link>
                        <span className="text-xs text-muted-foreground">Chapter 1089</span>
                      </div>
                      <p className="text-sm">This chapter was amazing! I can't believe what happened to Luffy!</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>2023-03-15</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Link href="/manga/3" className="font-medium hover:underline">
                          Jujutsu Kaisen
                        </Link>
                        <span className="text-xs text-muted-foreground">Chapter 223</span>
                      </div>
                      <p className="text-sm">
                        The art in this chapter is on another level. Gege-sensei never disappoints!
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>2023-03-14</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}

