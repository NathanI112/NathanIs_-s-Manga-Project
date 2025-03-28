"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, Search, FileUp } from "lucide-react"
import Link from "next/link"

interface Manga {
  id: number
  title: string
  author: string | null
  status: string
  genres: string[] | null
  views: number
  created_at: string
}

export default function AdminMangaList() {
  const [mangas, setMangas] = useState<Manga[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchMangas()
  }, [currentPage, searchQuery])

  const fetchMangas = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch from an API
      // For now, we'll simulate it with localStorage data
      let mangaList = []
      try {
        mangaList = JSON.parse(localStorage.getItem("mangaList") || "[]")
      } catch (error) {
        console.error("Error loading manga from localStorage:", error)
      }

      // Filter by search query
      if (searchQuery) {
        mangaList = mangaList.filter((manga: any) => manga.title.toLowerCase().includes(searchQuery.toLowerCase()))
      }

      // Calculate pagination
      const total = Math.ceil(mangaList.length / itemsPerPage)
      setTotalPages(total || 1)

      // Paginate results
      const start = (currentPage - 1) * itemsPerPage
      const end = start + itemsPerPage
      const paginatedManga = mangaList.slice(start, end)

      setMangas(paginatedManga)
    } catch (error) {
      console.error("Error fetching mangas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteManga = async (id: number) => {
    if (!confirm("Are you sure you want to delete this manga? This action cannot be undone.")) {
      return
    }

    try {
      // In a real app, this would call an API
      // For now, we'll simulate it with localStorage
      let mangaList = []
      try {
        mangaList = JSON.parse(localStorage.getItem("mangaList") || "[]")
        mangaList = mangaList.filter((manga: any) => manga.id !== id)
        localStorage.setItem("mangaList", JSON.stringify(mangaList))
      } catch (error) {
        console.error("Error updating localStorage:", error)
      }

      // Remove from state
      setMangas(mangas.filter((manga) => manga.id !== id))
    } catch (error) {
      console.error("Error deleting manga:", error)
      alert("An error occurred while deleting the manga.")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("tr-TR")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manga List</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search manga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[250px]"
            />
          </div>
          <Button asChild>
            <Link href="/admin/dashboard?tab=add">
              <Plus className="h-4 w-4 mr-2" />
              New Manga
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : mangas.length === 0 ? (
          <div className="text-center py-4">{searchQuery ? "No search results found." : "No manga added yet."}</div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Genres</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead>Added Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mangas.map((manga) => (
                    <TableRow key={manga.id}>
                      <TableCell className="font-medium">{manga.title}</TableCell>
                      <TableCell>{manga.author || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={manga.status === "completed" ? "secondary" : "default"}>
                          {manga.status === "ongoing"
                            ? "Ongoing"
                            : manga.status === "completed"
                              ? "Completed"
                              : manga.status === "hiatus"
                                ? "On Hiatus"
                                : "Cancelled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {manga.genres?.slice(0, 3).map((genre, index) => (
                            <Badge key={index} variant="outline">
                              {genre}
                            </Badge>
                          ))}
                          {manga.genres && manga.genres.length > 3 && (
                            <Badge variant="outline">+{manga.genres.length - 3}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{manga.views?.toLocaleString() || 0}</TableCell>
                      <TableCell>{formatDate(manga.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link href={`/admin/manga/${manga.id}/chapters`}>
                              <FileUp className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" asChild>
                            <Link href={`/admin/manga/${manga.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteManga(manga.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

