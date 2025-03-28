"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, Ban } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AdminMangaList from "@/components/admin-manga-list"
import AdminAddManga from "@/components/admin-add-manga"
import AdminUserManagement from "@/components/admin-user-management"
import AdminChapterManagement from "@/components/admin-chapter-management"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AdminPopularManga } from "@/components/admin-popular-manga"
import { useSupabaseAuth } from "@/components/supabase-auth-provider"
import { createClientSupabaseClient } from "@/lib/supabase/client"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalManga: 0,
    totalChapters: 0,
    totalUsers: 0,
    totalViews: 0,
  })
  const { user, isAdmin } = useSupabaseAuth()
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [popularTimeframe, setPopularTimeframe] = useState("weekly")
  const [setIsAdmin, setSetIsAdmin] = useState(false)

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalManga: 0,
    totalChapters: 0,
    activeUsers: 0,
    bannedUsers: 0,
    recentActivity: [],
    popularManga: [],
  })

  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      router.push("/")
    }

    fetchStats()
  }, [user, isAdmin, router])

  const fetchStats = async () => {
    try {
      // Get manga count
      const { count: mangaCount, error: mangaError } = await supabase
        .from("manga")
        .select("*", { count: "exact", head: true })

      // Get chapters count
      const { count: chaptersCount, error: chaptersError } = await supabase
        .from("chapters")
        .select("*", { count: "exact", head: true })

      // Get users count
      const { count: usersCount, error: usersError } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })

      // Get total views
      const { data: viewsData, error: viewsError } = await supabase.from("manga").select("views")

      const totalViews = viewsData?.reduce((sum, manga) => sum + manga.views, 0) || 0

      setStats({
        totalManga: mangaCount || 0,
        totalChapters: chaptersCount || 0,
        totalUsers: usersCount || 0,
        totalViews,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  // Check if user is admin on component mount
  useEffect(() => {
    const checkAdminStatus = () => {
      // First check adminSession
      const adminSession = localStorage.getItem("adminSession")
      if (!adminSession) {
        router.push("/admin/login")
        return
      }

      try {
        const session = JSON.parse(adminSession)
        if (!session.isAdmin) {
          router.push("/admin/login")
          return
        }

        // Also check if the user is logged in and has admin privileges
        const userStr = localStorage.getItem("mangaUser")
        if (userStr) {
          const user = JSON.parse(userStr)
          if (!user.isAdmin) {
            router.push("/admin/login")
            return
          }
        }

        setSetIsAdmin(true)
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/admin/login")
      }
    }

    //checkAdminStatus()
  }, [router])

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isAdmin) return

      try {
        // Load manga count
        let mangaCount = 0
        let chaptersCount = 0

        try {
          // Try to get manga from localStorage
          const mangaList = JSON.parse(localStorage.getItem("mangaList") || "[]")
          mangaCount = mangaList.length

          // Try to get chapters from localStorage
          const chapters = JSON.parse(localStorage.getItem("mangaChapters") || "[]")
          chaptersCount = chapters.length
        } catch (error) {
          console.error("Error loading data from localStorage:", error)
        }

        // Try to get from IndexedDB if available
        try {
          const response = await fetch("/api/manga")
          if (response.ok) {
            const data = await response.json()
            mangaCount = data.length
          }

          const chaptersResponse = await fetch("/api/chapters")
          if (chaptersResponse.ok) {
            const chaptersData = await chaptersResponse.json()
            chaptersCount = chaptersData.length
          }
        } catch (error) {
          console.error("Error loading data from API:", error)
        }

        // Get popular manga
        const popularManga = await getPopularManga(popularTimeframe)

        // Update dashboard stats
        setDashboardStats({
          totalManga: mangaCount,
          totalChapters: chaptersCount,
          activeUsers: 12843, // Mock data
          bannedUsers: 24, // Mock data
          recentActivity: getRecentActivity(),
          popularManga: popularManga,
        })
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      }
    }

    //loadDashboardData()
  }, [isAdmin, popularTimeframe, toast])

  // Get popular manga based on timeframe
  const getPopularManga = async (timeframe) => {
    // In a real app, this would fetch from an API with the timeframe parameter
    // For now, we'll simulate it with localStorage data

    try {
      const mangaList = JSON.parse(localStorage.getItem("mangaList") || "[]")

      // Sort by views (in a real app, you'd filter by the timeframe)
      const sortedManga = [...mangaList].sort((a, b) => {
        const viewsA = a.views || 0
        const viewsB = b.views || 0
        return viewsB - viewsA
      })

      // Return top 5
      return sortedManga.slice(0, 5).map((manga) => ({
        id: manga.id,
        title: manga.title,
        cover: manga.cover || "/placeholder.svg?height=56&width=40",
        views: manga.views || Math.floor(Math.random() * 1000000) + 100000, // Random views if not set
        latestChapter: manga.latestChapter || "1",
      }))
    } catch (error) {
      console.error("Error getting popular manga:", error)
      return []
    }
  }

  // Get recent activity (mock data for now)
  const getRecentActivity = () => {
    return [
      {
        type: "manga_added",
        title: "One Piece",
        time: "10 minutes ago",
        icon: <Plus className="h-4 w-4 text-primary" />,
      },
      {
        type: "chapter_added",
        title: "Jujutsu Kaisen Ch. 223",
        time: "1 hour ago",
        icon: <FileText className="h-4 w-4 text-primary" />,
      },
      {
        type: "user_banned",
        title: "SpamUser123",
        time: "3 hours ago",
        icon: <Ban className="h-4 w-4 text-destructive" />,
      },
      {
        type: "chapter_added",
        title: "Demon Slayer Ch. 205",
        time: "5 hours ago",
        icon: <FileText className="h-4 w-4 text-primary" />,
      },
    ]
  }

  const handleLogout = () => {
    localStorage.removeItem("adminSession")
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
    router.push("/admin/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Router will redirect, this prevents flash of content
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="manga">Mangalar</TabsTrigger>
          <TabsTrigger value="chapters">Bölümler</TabsTrigger>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="add">Manga Ekle</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Toplam Manga</CardTitle>
                <CardDescription>Sistemdeki manga sayısı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalManga}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Toplam Bölüm</CardTitle>
                <CardDescription>Sistemdeki bölüm sayısı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalChapters}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
                <CardDescription>Kayıtlı kullanıcı sayısı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Toplam Görüntülenme</CardTitle>
                <CardDescription>Tüm mangaların görüntülenme sayısı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <AdminPopularManga />
        </TabsContent>

        <TabsContent value="manga">
          <AdminMangaList />
        </TabsContent>

        <TabsContent value="chapters">
          <AdminChapterManagement />
        </TabsContent>

        <TabsContent value="users">
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="add">
          <AdminAddManga onSuccess={() => setActiveTab("manga")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

