import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Sample genre data
const genres = [
  {
    id: "action",
    name: "Action",
    description: "Exciting stories with dynamic fight scenes and high-energy activities",
    count: 156,
  },
  {
    id: "adventure",
    name: "Adventure",
    description: "Stories about journeys, exploration, and exciting experiences",
    count: 142,
  },
  {
    id: "comedy",
    name: "Comedy",
    description: "Humorous stories designed to make you laugh",
    count: 128,
  },
  {
    id: "drama",
    name: "Drama",
    description: "Character-driven stories with emotional themes",
    count: 113,
  },
  {
    id: "fantasy",
    name: "Fantasy",
    description: "Stories with magical elements and supernatural phenomena",
    count: 98,
  },
  {
    id: "horror",
    name: "Horror",
    description: "Frightening stories designed to scare and unsettle",
    count: 76,
  },
  {
    id: "mystery",
    name: "Mystery",
    description: "Stories involving secrets, puzzles, and the unknown",
    count: 82,
  },
  {
    id: "romance",
    name: "Romance",
    description: "Stories focused on romantic relationships and love",
    count: 104,
  },
  {
    id: "sci-fi",
    name: "Sci-Fi",
    description: "Stories based on scientific concepts and technology",
    count: 91,
  },
  {
    id: "slice-of-life",
    name: "Slice of Life",
    description: "Stories depicting everyday experiences and realistic settings",
    count: 87,
  },
  {
    id: "sports",
    name: "Sports",
    description: "Stories centered around athletic activities and competitions",
    count: 65,
  },
  {
    id: "supernatural",
    name: "Supernatural",
    description: "Stories involving paranormal elements beyond scientific understanding",
    count: 94,
  },
  {
    id: "thriller",
    name: "Thriller",
    description: "Suspenseful stories designed to excite and provoke anxiety",
    count: 72,
  },
  {
    id: "isekai",
    name: "Isekai",
    description: "Stories where characters are transported to another world",
    count: 58,
  },
  {
    id: "mecha",
    name: "Mecha",
    description: "Stories featuring robots, cyborgs, and mechanical technology",
    count: 43,
  },
]

export default function GenresPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Manga Genres</h1>
      <p className="text-muted-foreground mb-8">Browse manga by genre</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {genres.map((genre) => (
          <Link key={genre.id} href={`/genres/${genre.id}`}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle>{genre.name}</CardTitle>
                <CardDescription>{genre.count} manga</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{genre.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

