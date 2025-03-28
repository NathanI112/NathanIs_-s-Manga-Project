import type { MetadataRoute } from "next"

// This would come from your database in a real application
const getAllManga = () => {
  return [
    { id: 1, title: "One Piece", lastUpdated: "2023-03-10" },
    { id: 2, title: "Demon Slayer", lastUpdated: "2021-05-23" },
    { id: 3, title: "Jujutsu Kaisen", lastUpdated: "2023-03-05" },
    { id: 4, title: "My Hero Academia", lastUpdated: "2023-03-07" },
    { id: 5, title: "Attack on Titan", lastUpdated: "2021-04-09" },
  ]
}

// This would come from your database in a real application
const getAllGenres = () => {
  return [
    "action",
    "adventure",
    "comedy",
    "drama",
    "fantasy",
    "horror",
    "mystery",
    "romance",
    "sci-fi",
    "slice-of-life",
    "sports",
    "supernatural",
    "thriller",
    "isekai",
    "mecha",
  ]
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mangaverse.example.com"

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/manga`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/latest`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/genres`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  // Manga routes
  const mangaRoutes = getAllManga().map((manga) => ({
    url: `${baseUrl}/manga/${manga.id}`,
    lastModified: new Date(manga.lastUpdated),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  // Genre routes
  const genreRoutes = getAllGenres().map((genre) => ({
    url: `${baseUrl}/genres/${genre}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [...staticRoutes, ...mangaRoutes, ...genreRoutes]
}

