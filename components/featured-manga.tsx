"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

const featuredManga = [
  {
    id: 1,
    title: "One Piece",
    description:
      "Follow Monkey D. Luffy and his swashbuckling crew in their search for the ultimate treasure, One Piece.",
    image: "/placeholder.svg?height=600&width=400",
    rating: 4.9,
    chapters: 1089,
    genres: ["Action", "Adventure", "Fantasy"],
  },
  {
    id: 2,
    title: "Demon Slayer",
    description:
      "Tanjiro sets out to become a demon slayer after his family is slaughtered and his sister is turned into a demon.",
    image: "/placeholder.svg?height=600&width=400",
    rating: 4.8,
    chapters: 205,
    genres: ["Action", "Supernatural", "Drama"],
  },
  {
    id: 3,
    title: "Jujutsu Kaisen",
    description: "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself.",
    image: "/placeholder.svg?height=600&width=400",
    rating: 4.7,
    chapters: 223,
    genres: ["Action", "Supernatural", "Horror"],
  },
]

export default function FeaturedManga() {
  const [current, setCurrent] = useState(0)

  const next = () => {
    setCurrent((current + 1) % featuredManga.length)
  }

  const prev = () => {
    setCurrent((current - 1 + featuredManga.length) % featuredManga.length)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      next()
    }, 5000)
    return () => clearInterval(interval)
  }, [current])

  const manga = featuredManga[current]

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10">
      <div className="container relative z-10 py-6 md:py-10 px-4">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <div className="relative w-full max-w-[250px] mx-auto">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-xl">
              <Image
                src={manga.image || "/placeholder.svg"}
                alt={manga.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 250px, 300px"
              />
            </div>
          </div>

          <div className="space-y-3 md:space-y-4 text-center w-full max-w-2xl">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{manga.title}</h1>

            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="ml-1 text-sm font-medium">{manga.rating}</span>
              </div>
              <div className="text-sm text-muted-foreground">{manga.chapters} chapters</div>
            </div>

            <p className="text-muted-foreground max-w-prose mx-auto">{manga.description}</p>

            <div className="flex flex-wrap gap-2 justify-center">
              {manga.genres.map((genre) => (
                <Link key={genre} href={`/genres/${genre.toLowerCase()}`}>
                  <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium">{genre}</span>
                </Link>
              ))}
            </div>

            <div className="flex gap-3 pt-2 justify-center">
              <Link href={`/manga/${manga.id}`}>
                <Button>Read Now</Button>
              </Link>
              <Link href={`/manga/${manga.id}`}>
                <Button variant="outline">Details</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 md:left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/50 backdrop-blur"
        onClick={prev}
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        <span className="sr-only">Previous</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 md:right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/50 backdrop-blur"
        onClick={next}
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        <span className="sr-only">Next</span>
      </Button>
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {featuredManga.map((_, i) => (
          <button
            key={i}
            className={`h-2 w-2 rounded-full ${i === current ? "bg-primary" : "bg-muted"}`}
            onClick={() => setCurrent(i)}
          >
            <span className="sr-only">Slide {i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

