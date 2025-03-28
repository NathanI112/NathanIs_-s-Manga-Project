"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, TrendingUp, TrendingDown, Minus, ArrowUpDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface PopularMangaListProps {
  timeframe?: "weekly" | "monthly" | "yearly"
}

export function AdminPopularManga({ timeframe = "weekly" }: PopularMangaListProps) {
  const [popularManga, setPopularManga] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<string>("views")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadPopularManga = async () => {
      setIsLoading(true)

      try {
        // In a real app, this would be an API call with the timeframe parameter
        // For now, we'll simulate it with localStorage data
        let mangaList = []

        try {
          mangaList = JSON.parse(localStorage.getItem("mangaList") || "[]")
        } catch (error) {
          console.error("Error loading manga from localStorage:", error)
          mangaList = []
        }

        // Add some random stats based on timeframe
        const mangaWithStats = mangaList.map((manga) => {
          const views = manga.views || Math.floor(Math.random() * 1000000) + 100000

          // Generate trend data based on timeframe
          let trend = 0
          let trendPercentage = 0

          if (timeframe === "weekly") {
            trend = Math.floor(Math.random() * 20000) - 10000
            trendPercentage = Math.round((trend / views) * 100)
          } else if (timeframe === "monthly") {
            trend = Math.floor(Math.random() * 50000) - 20000
            trendPercentage = Math.round((trend / views) * 100)
          } else {
            trend = Math.floor(Math.random() * 200000) - 50000
            trendPercentage = Math.round((trend / views) * 100)
          }

          return {
            id: manga.id,
            title: manga.title,
            cover: manga.cover || "/placeholder.svg?height=60&width=40",
            views,
            trend,
            trendPercentage,
            engagement: Math.floor(Math.random() * 100),
            latestChapter: manga.latestChapter || Math.floor(Math.random() * 100) + 1,
          }
        })

        setPopularManga(mangaWithStats)
      } catch (error) {
        console.error("Error loading popular manga:", error)
        setPopularManga([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPopularManga()
  }, [timeframe])

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Filter and sort manga
  const filteredAndSortedManga = popularManga
    .filter((manga) => manga.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortField === "title") {
        return sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      } else if (sortField === "trend") {
        return sortDirection === "asc" ? a.trendPercentage - b.trendPercentage : b.trendPercentage - a.trendPercentage
      } else if (sortField === "engagement") {
        return sortDirection === "asc" ? a.engagement - b.engagement : b.engagement - a.engagement
      } else {
        // Default sort by views
        return sortDirection === "asc" ? a.views - b.views : b.views - a.views
      }
    })

  // Get trend icon based on percentage
  const getTrendIcon = (trendPercentage: number) => {
    if (trendPercentage > 5) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (trendPercentage < -5) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    } else {
      return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  // Get trend text color based on percentage
  const getTrendTextColor = (trendPercentage: number) => {
    if (trendPercentage > 5) {
      return "text-green-500"
    } else if (trendPercentage < -5) {
      return "text-red-500"
    } else {
      return "text-yellow-500"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (popularManga.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No manga data available</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search manga..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {timeframe === "weekly" ? "Last 7 days" : timeframe === "monthly" ? "Last 30 days" : "Last 365 days"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {popularManga.reduce((sum, manga) => sum + manga.views, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {Math.round(popularManga.reduce((sum, manga) => sum + manga.engagement, 0) / popularManga.length)}%
            </div>
            <p className="text-sm text-muted-foreground">Average Engagement</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{popularManga.length}</div>
            <p className="text-sm text-muted-foreground">Active Manga</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Cover</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto font-medium text-left"
                  onClick={() => handleSort("title")}
                >
                  Title
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto font-medium"
                  onClick={() => handleSort("views")}
                >
                  Views
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto font-medium"
                  onClick={() => handleSort("trend")}
                >
                  Trend
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto font-medium"
                  onClick={() => handleSort("engagement")}
                >
                  Engagement
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell text-right">Latest Ch.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedManga.map((manga) => (
              <TableRow key={manga.id}>
                <TableCell>
                  <Image
                    src={manga.cover || "/placeholder.svg"}
                    alt={manga.title}
                    width={40}
                    height={60}
                    className="rounded-sm object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/manga/${manga.id}`} className="hover:underline">
                    {manga.title}
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    <span>{manga.views.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {getTrendIcon(manga.trendPercentage)}
                    <span className={getTrendTextColor(manga.trendPercentage)}>
                      {manga.trendPercentage > 0 ? "+" : ""}
                      {manga.trendPercentage}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <Progress value={manga.engagement} className="h-2" />
                    <span className="text-sm">{manga.engagement}%</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-right">Ch. {manga.latestChapter}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

