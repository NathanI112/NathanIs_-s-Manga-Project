"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
  ArrowUpDown,
  Plus,
  Search,
  FileText,
  Upload,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample chapter data
const chapterData = [
  {
    id: "1",
    mangaId: "1",
    mangaTitle: "One Piece",
    number: "1089",
    title: "The Truth of the Empty Throne",
    pages: 18,
    views: 1250000,
    uploadDate: "2023-03-10",
    status: "published",
  },
  {
    id: "2",
    mangaId: "1",
    mangaTitle: "One Piece",
    number: "1088",
    title: "Luffy's Dream",
    pages: 20,
    views: 1200000,
    uploadDate: "2023-03-03",
    status: "published",
  },
  {
    id: "3",
    mangaId: "1",
    mangaTitle: "One Piece",
    number: "1087",
    title: "The Will of Ohara",
    pages: 19,
    views: 1180000,
    uploadDate: "2023-02-24",
    status: "published",
  },
  {
    id: "4",
    mangaId: "2",
    mangaTitle: "Demon Slayer",
    number: "205",
    title: "The Final Battle",
    pages: 22,
    views: 980000,
    uploadDate: "2021-05-23",
    status: "published",
  },
  {
    id: "5",
    mangaId: "3",
    mangaTitle: "Jujutsu Kaisen",
    number: "223",
    title: "Sukuna's Domain",
    pages: 21,
    views: 890000,
    uploadDate: "2023-03-05",
    status: "published",
  },
  {
    id: "6",
    mangaId: "1",
    mangaTitle: "One Piece",
    number: "1090",
    title: "Draft Chapter",
    pages: 0,
    views: 0,
    uploadDate: "N/A",
    status: "draft",
  },
]

// Sample manga data for dropdown
const mangaOptions = [
  { id: "1", title: "One Piece" },
  { id: "2", title: "Demon Slayer" },
  { id: "3", title: "Jujutsu Kaisen" },
  { id: "4", title: "My Hero Academia" },
  { id: "5", title: "Attack on Titan" },
]

export default function AdminChapterManagement() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [chapters, setChapters] = useState(chapterData)
  const [selectedChapter, setSelectedChapter] = useState<(typeof chapterData)[0] | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [filterManga, setFilterManga] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortField, setSortField] = useState("uploadDate")
  const [sortDirection, setSortDirection] = useState("desc")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  // Edit form state
  const [editForm, setEditForm] = useState({
    number: "",
    title: "",
    status: "published",
  })

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    mangaId: "",
    number: "",
    title: "",
  })

  // Load chapters from localStorage
  useEffect(() => {
    try {
      const savedChapters = JSON.parse(localStorage.getItem("mangaChapters") || "[]")
      if (savedChapters.length > 0) {
        // Get manga titles for the chapters
        const mangaList = JSON.parse(localStorage.getItem("mangaList") || "[]")
        const mangaMap = new Map()

        // Create a map of manga IDs to titles from both local storage and default data
        ;[...mangaOptions, ...mangaList].forEach((manga) => {
          mangaMap.set(manga.id.toString(), manga.title)
        })

        // Format chapters with manga titles
        const formattedChapters = savedChapters.map((chapter) => ({
          id: chapter.id.toString(),
          mangaId: chapter.mangaId.toString(),
          mangaTitle: mangaMap.get(chapter.mangaId.toString()) || "Unknown Manga",
          number: chapter.chapterNumber,
          title: chapter.title,
          pages: chapter.pages,
          views: chapter.views,
          uploadDate: chapter.uploadDate,
          status: chapter.status || "published",
        }))

        setChapters([...formattedChapters, ...chapterData])
      }
    } catch (error) {
      console.error("Error loading chapters:", error)
    }
  }, [])

  const filteredChapters = chapters
    .filter((chapter) => {
      // Text search filter
      const matchesSearch =
        chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.mangaTitle.toLowerCase().includes(searchTerm.toLowerCase())

      // Manga filter
      const matchesManga = filterManga === "all" || chapter.mangaId === filterManga

      // Status filter
      const matchesStatus = filterStatus === "all" || chapter.status === filterStatus

      return matchesSearch && matchesManga && matchesStatus
    })
    .sort((a, b) => {
      // Handle sorting
      if (sortField === "number") {
        return sortDirection === "asc"
          ? Number.parseInt(a.number) - Number.parseInt(b.number)
          : Number.parseInt(b.number) - Number.parseInt(a.number)
      } else if (sortField === "views") {
        return sortDirection === "asc" ? a.views - b.views : b.views - a.views
      } else if (sortField === "uploadDate") {
        if (a.uploadDate === "N/A") return 1
        if (b.uploadDate === "N/A") return -1
        return sortDirection === "asc"
          ? new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
          : new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      } else {
        // Default sort by title
        return sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      }
    })

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new field and default to desc
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleDeleteChapter = () => {
    if (!selectedChapter) return

    setChapters(chapters.filter((chapter) => chapter.id !== selectedChapter.id))
    setDeleteDialogOpen(false)

    toast({
      title: "Chapter Deleted",
      description: `Chapter ${selectedChapter.number} of ${selectedChapter.mangaTitle} has been deleted.`,
    })
  }

  const handleEditChapter = () => {
    if (!selectedChapter) return
    if (!editForm.number) {
      toast({
        title: "Missing Chapter Number",
        description: "Please enter a chapter number",
        variant: "destructive",
      })
      return
    }

    const updatedChapters = chapters.map((chapter) => {
      if (chapter.id === selectedChapter.id) {
        return {
          ...chapter,
          number: editForm.number,
          title: editForm.title,
          status: editForm.status,
        }
      }
      return chapter
    })

    setChapters(updatedChapters)
    setEditDialogOpen(false)

    toast({
      title: "Chapter Updated",
      description: `Chapter ${editForm.number} has been updated.`,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const reorderFiles = () => {
    // Sort files by name (assuming they're named with numbers)
    const sorted = [...uploadedFiles].sort((a, b) => {
      const nameA = a.name.toLowerCase()
      const nameB = b.name.toLowerCase()
      return nameA.localeCompare(nameB, undefined, { numeric: true })
    })
    setUploadedFiles(sorted)
  }

  const handleUploadChapter = () => {
    if (!uploadForm.mangaId) {
      toast({
        title: "Missing Manga",
        description: "Please select a manga",
        variant: "destructive",
      })
      return
    }

    if (!uploadForm.number) {
      toast({
        title: "Missing Chapter Number",
        description: "Please enter a chapter number",
        variant: "destructive",
      })
      return
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "No Pages",
        description: "Please upload at least one page",
        variant: "destructive",
      })
      return
    }

    // Find manga title
    const manga = mangaOptions.find((m) => m.id === uploadForm.mangaId)
    if (!manga) return

    // Create new chapter
    const newChapter = {
      id: Date.now().toString(),
      mangaId: uploadForm.mangaId,
      mangaTitle: manga.title,
      number: uploadForm.number,
      title: uploadForm.title || `Chapter ${uploadForm.number}`,
      pages: uploadedFiles.length,
      views: 0,
      uploadDate: new Date().toISOString().split("T")[0],
      status: "published" as const,
    }

    setChapters([newChapter, ...chapters])
    setUploadDialogOpen(false)
    setUploadedFiles([])
    setUploadForm({
      mangaId: "",
      number: "",
      title: "",
    })

    toast({
      title: "Chapter Uploaded",
      description: `Chapter ${uploadForm.number} of ${manga.title} has been uploaded.`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chapters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterManga} onValueChange={setFilterManga}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter by manga" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manga</SelectItem>
              {mangaOptions.map((manga) => (
                <SelectItem key={manga.id} value={manga.id}>
                  {manga.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Chapter
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto font-medium"
                  onClick={() => handleSort("number")}
                >
                  Ch. #
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
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
              <TableHead>Manga</TableHead>
              <TableHead className="hidden md:table-cell">Pages</TableHead>
              <TableHead className="hidden md:table-cell">
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
              <TableHead className="hidden md:table-cell">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto font-medium"
                  onClick={() => handleSort("uploadDate")}
                >
                  Uploaded
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChapters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No chapters found
                </TableCell>
              </TableRow>
            ) : (
              filteredChapters.map((chapter) => (
                <TableRow key={chapter.id}>
                  <TableCell className="font-medium">{chapter.number}</TableCell>
                  <TableCell>{chapter.title}</TableCell>
                  <TableCell>{chapter.mangaTitle}</TableCell>
                  <TableCell className="hidden md:table-cell">{chapter.pages}</TableCell>
                  <TableCell className="hidden md:table-cell">{chapter.views.toLocaleString()}</TableCell>
                  <TableCell className="hidden md:table-cell">{chapter.uploadDate}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={chapter.status === "published" ? "default" : "secondary"}>
                      {chapter.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedChapter(chapter)
                            setEditForm({
                              number: chapter.number,
                              title: chapter.title,
                              status: chapter.status,
                            })
                            setEditDialogOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedChapter(chapter)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Chapter Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chapter</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chapter? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedChapter && (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Manga:</span> {selectedChapter.mangaTitle}
                </p>
                <p>
                  <span className="font-medium">Chapter:</span> {selectedChapter.number}
                </p>
                <p>
                  <span className="font-medium">Title:</span> {selectedChapter.title}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-md border p-3 bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">This will permanently delete the chapter and all its pages.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChapter}>
              Delete Chapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Chapter Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Chapter</DialogTitle>
            <DialogDescription>
              {selectedChapter && `Edit chapter details for ${selectedChapter.mangaTitle}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="chapterNumber">Chapter Number *</Label>
              <Input
                id="chapterNumber"
                value={editForm.number}
                onChange={(e) => setEditForm((prev) => ({ ...prev, number: e.target.value }))}
                placeholder="e.g. 42"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapterTitle">Chapter Title</Label>
              <Input
                id="chapterTitle"
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. The Final Battle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapterStatus">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, status: value as "published" | "draft" }))}
              >
                <SelectTrigger id="chapterStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditChapter}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Chapter Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Upload New Chapter</DialogTitle>
            <DialogDescription>Add a new chapter to your manga collection</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mangaSelect">Manga *</Label>
                <Select
                  value={uploadForm.mangaId}
                  onValueChange={(value) => setUploadForm((prev) => ({ ...prev, mangaId: value }))}
                >
                  <SelectTrigger id="mangaSelect">
                    <SelectValue placeholder="Select manga" />
                  </SelectTrigger>
                  <SelectContent>
                    {mangaOptions.map((manga) => (
                      <SelectItem key={manga.id} value={manga.id}>
                        {manga.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="uploadChapterNumber">Chapter Number *</Label>
                <Input
                  id="uploadChapterNumber"
                  value={uploadForm.number}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, number: e.target.value }))}
                  placeholder="e.g. 42"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="uploadChapterTitle">Chapter Title (Optional)</Label>
              <Input
                id="uploadChapterTitle"
                value={uploadForm.title}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. The Final Battle"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Upload Pages *</Label>
                {uploadedFiles.length > 0 && (
                  <Button type="button" variant="outline" size="sm" onClick={reorderFiles}>
                    Sort by Name
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                {/* File upload card */}
                <Card className="border-dashed">
                  <CardContent className="p-0">
                    <label className="flex flex-col items-center justify-center w-full h-[140px] cursor-pointer">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                    </label>
                  </CardContent>
                </Card>

                {/* Uploaded files */}
                {uploadedFiles.map((file, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="p-0">
                      <div className="relative h-[140px] w-full">
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                          {file.type.startsWith("image/") ? (
                            <img
                              src={URL.createObjectURL(file) || "/placeholder.svg"}
                              alt={`Page ${index + 1}`}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <FileText className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove file</span>
                        </Button>
                        <div className="absolute bottom-1 left-1 bg-background/80 text-xs px-2 py-1 rounded">
                          Page {index + 1}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadChapter}>Upload Chapter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

