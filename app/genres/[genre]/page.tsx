"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import MangaGrid from "@/components/manga-grid"

// Sample genre data
const genres = [
  { id: "action", name: "Action" },
  { id: "adventure", name: "Adventure" },
  { id: "comedy", name: "Comedy" },
  { id: "drama", name: "Drama" },
  { id: "fantasy", name: "Fantasy" },
  { id: "horror", name: "Horror" },
  { id: "mystery", name: "Mystery" },
  { id: "romance", name: "Romance" },
  { id: "sci-fi", name: "Sci-Fi" },
  { id: "slice-of-life", name: "Slice of Life" },
  { id: "sports", name: "Sports" },
  { id: "supernatural", name: "Supernatural" },
  { id: "thriller", name: "Thriller" },
  { id: "isekai", name: "Isekai" },
  { id: "mecha", name: "Mecha" },
]

// Sample manga data
const mangaData = [
  {
    id: 1,
    title: "One Piece",
    cover: "/placeholder.svg?height=400&width=300",
    rating: 4.9,
    latestChapter: 1089,
    isNew: true,
    genres: ["action", "adventure", "comedy", "fantasy"],
  },
  {
    id: 2,
    title: "Demon Slayer",
    cover: "/placeholder.svg?height=400&width=300",
    rating: 4.8,
    latestChapter: 205,
    isNew: false,
    genres: ["action", "supernatural", "drama"],
  },
  {
    id: 3,
    title: "Jujutsu Kaisen",
    cover: "/placeholder.svg?height=400&width=300",
    rating: 4.7,
    latestChapter: 223,
    isNew: true,
    genres: ["action", "supernatural", "horror"],
  },
  {
    id: 4,
    title: "My Hero Academia",
    cover: "/placeholder.svg?height=400&width=300",
    rating: 4.6,
    latestChapter: 402,
    isNew: false,
    genres: ["action", "sci-fi", "comedy"],
  },
  {
    id: 5,
    title: "Attack on Titan",
    cover: "/placeholder.svg?height=400&width=300",
    rating: 4.9,
    latestChapter: 139,
    isNew: false,
    genres: ["action", "drama", "horror", "mystery"],
  },
  {
    id: 6,
    title: "Chainsaw Man",
    cover: "/placeholder.svg?height=400&width=300",
    rating: 4.8,
    latestChapter: 129,
    isNew: true,
    genres: ["action", "supernatural", "horror"],
  },
  {
    id: 7,
    title: "Spy x Family",
    cover: "/placeholder.svg?height=400&width=300",
    rating: 4.7,
    latestChapter: 78,
    isNew: false,
    genres: ["comedy", "action", "slice-of-life"],
  },
  {
    id: 8,
    title: "Tokyo Revengers",
    cover: "/placeholder.svg?height=400&width=300",
    rating: 4.5,
    latestChapter: 278,
    isNew: false,
    genres: ["action", "drama", "supernatural"],
  },
]

export default function GenrePage() {
  const params = useParams()
  const genreId = params.genre as string
  const [genreName, setGenreName] = useState("")
  const [mangaList, setMangaList] = useState<typeof mangaData>([])

  useEffect(() => {
    // Find genre name
    const genre = genres.find((g) => g.id === genreId)
    setGenreName(genre?.name || "Unknown Genre")

    // Filter manga by genre
    const filtered = mangaData.filter((manga) => manga.genres.includes(genreId))
    setMangaList(filtered)
  }, [genreId])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">{genreName} Manga</h1>
      <p className="text-muted-foreground mb-8">
        Showing {mangaList.length} manga in the {genreName.toLowerCase()} genre
      </p>

      {mangaList.length > 0 ? (
        <MangaGrid manga={mangaList} />
      ) : (
        <div className="text-center py-12">
          <p className="text-xl font-medium mb-2">No manga found</p>
          <p className="text-muted-foreground">We couldn't find any manga in the {genreName.toLowerCase()} genre</p>
        </div>
      )}
    </div>
  )
}

