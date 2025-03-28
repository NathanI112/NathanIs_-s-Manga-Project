// Mock data for development
export const mockManga = [
  {
    id: 1,
    title: "One Piece",
    description:
      "Follow Monkey D. Luffy and his swashbuckling crew in their search for the ultimate treasure, the One Piece.",
    author: "Eiichiro Oda",
    artist: "Eiichiro Oda",
    cover: "/placeholder.svg?height=400&width=300&text=One+Piece",
    banner: "/placeholder.svg?height=200&width=800&text=One+Piece+Banner",
    status: "ongoing",
    releaseYear: 1999,
    genres: ["Action", "Adventure", "Comedy", "Fantasy", "Shounen"],
    rating: 4.9,
    views: 15000,
    isAdult: false,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-06-15T00:00:00.000Z",
  },
  {
    id: 2,
    title: "Naruto",
    description:
      "Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage, the village's leader and strongest ninja.",
    author: "Masashi Kishimoto",
    artist: "Masashi Kishimoto",
    cover: "/placeholder.svg?height=400&width=300&text=Naruto",
    banner: "/placeholder.svg?height=200&width=800&text=Naruto+Banner",
    status: "completed",
    releaseYear: 1999,
    genres: ["Action", "Adventure", "Martial Arts", "Shounen"],
    rating: 4.7,
    views: 12000,
    isAdult: false,
    createdAt: "2023-01-02T00:00:00.000Z",
    updatedAt: "2023-05-20T00:00:00.000Z",
  },
  {
    id: 3,
    title: "Attack on Titan",
    description:
      "In a world where humanity lives inside cities surrounded by enormous walls due to the Titans, gigantic humanoid creatures who devour humans seemingly without reason.",
    author: "Hajime Isayama",
    artist: "Hajime Isayama",
    cover: "/placeholder.svg?height=400&width=300&text=Attack+on+Titan",
    banner: "/placeholder.svg?height=200&width=800&text=Attack+on+Titan+Banner",
    status: "completed",
    releaseYear: 2009,
    genres: ["Action", "Drama", "Fantasy", "Horror", "Mystery"],
    rating: 4.8,
    views: 10000,
    isAdult: false,
    createdAt: "2023-01-03T00:00:00.000Z",
    updatedAt: "2023-04-10T00:00:00.000Z",
  },
  {
    id: 4,
    title: "My Hero Academia",
    description:
      "In a world where people with superpowers (known as 'Quirks') are the norm, Izuku Midoriya has dreams of one day becoming a Hero, despite being bullied by his classmates for not having a Quirk.",
    author: "Kohei Horikoshi",
    artist: "Kohei Horikoshi",
    cover: "/placeholder.svg?height=400&width=300&text=My+Hero+Academia",
    banner: "/placeholder.svg?height=200&width=800&text=My+Hero+Academia+Banner",
    status: "ongoing",
    releaseYear: 2014,
    genres: ["Action", "Comedy", "School Life", "Shounen", "Superhero"],
    rating: 4.6,
    views: 9000,
    isAdult: false,
    createdAt: "2023-01-04T00:00:00.000Z",
    updatedAt: "2023-06-01T00:00:00.000Z",
  },
  {
    id: 5,
    title: "Demon Slayer",
    description:
      "Tanjiro Kamado's life changed when his family was slaughtered by demons, with his younger sister Nezuko being the only survivor but transformed into a demon herself.",
    author: "Koyoharu Gotouge",
    artist: "Koyoharu Gotouge",
    cover: "/placeholder.svg?height=400&width=300&text=Demon+Slayer",
    banner: "/placeholder.svg?height=200&width=800&text=Demon+Slayer+Banner",
    status: "completed",
    releaseYear: 2016,
    genres: ["Action", "Demons", "Historical", "Shounen", "Supernatural"],
    rating: 4.8,
    views: 11000,
    isAdult: false,
    createdAt: "2023-01-05T00:00:00.000Z",
    updatedAt: "2023-03-15T00:00:00.000Z",
  },
  {
    id: 6,
    title: "Jujutsu Kaisen",
    description:
      "Yuji Itadori is an unnaturally fit high school student living a normal life. But when he consumes a cursed object, he becomes host to a powerful Curse named Ryomen Sukuna.",
    author: "Gege Akutami",
    artist: "Gege Akutami",
    cover: "/placeholder.svg?height=400&width=300&text=Jujutsu+Kaisen",
    banner: "/placeholder.svg?height=200&width=800&text=Jujutsu+Kaisen+Banner",
    status: "ongoing",
    releaseYear: 2018,
    genres: ["Action", "Horror", "School Life", "Shounen", "Supernatural"],
    rating: 4.7,
    views: 8500,
    isAdult: false,
    createdAt: "2023-01-06T00:00:00.000Z",
    updatedAt: "2023-06-10T00:00:00.000Z",
  },
]

export const mockChapters = [
  {
    id: 1,
    mangaId: 1,
    chapterNumber: "1",
    title: "Romance Dawn",
    pages: Array(20)
      .fill(0)
      .map((_, i) => `/placeholder.svg?height=1400&width=900&text=One+Piece+Ch1+Page+${i + 1}`),
    uploadDate: "2023-01-01T00:00:00.000Z",
    views: 5000,
  },
  {
    id: 2,
    mangaId: 1,
    chapterNumber: "2",
    title: "They Call Him Luffy",
    pages: Array(22)
      .fill(0)
      .map((_, i) => `/placeholder.svg?height=1400&width=900&text=One+Piece+Ch2+Page+${i + 1}`),
    uploadDate: "2023-01-08T00:00:00.000Z",
    views: 4800,
  },
  {
    id: 3,
    mangaId: 2,
    chapterNumber: "1",
    title: "Uzumaki Naruto",
    pages: Array(24)
      .fill(0)
      .map((_, i) => `/placeholder.svg?height=1400&width=900&text=Naruto+Ch1+Page+${i + 1}`),
    uploadDate: "2023-01-02T00:00:00.000Z",
    views: 4500,
  },
  {
    id: 4,
    mangaId: 2,
    chapterNumber: "2",
    title: "Konohamaru!",
    pages: Array(23)
      .fill(0)
      .map((_, i) => `/placeholder.svg?height=1400&width=900&text=Naruto+Ch2+Page+${i + 1}`),
    uploadDate: "2023-01-09T00:00:00.000Z",
    views: 4300,
  },
  {
    id: 5,
    mangaId: 3,
    chapterNumber: "1",
    title: "To You, 2000 Years From Now",
    pages: Array(45)
      .fill(0)
      .map((_, i) => `/placeholder.svg?height=1400&width=900&text=AoT+Ch1+Page+${i + 1}`),
    uploadDate: "2023-01-03T00:00:00.000Z",
    views: 4200,
  },
  {
    id: 6,
    mangaId: 3,
    chapterNumber: "2",
    title: "That Day",
    pages: Array(40)
      .fill(0)
      .map((_, i) => `/placeholder.svg?height=1400&width=900&text=AoT+Ch2+Page+${i + 1}`),
    uploadDate: "2023-01-10T00:00:00.000Z",
    views: 4000,
  },
]

export const mockUsers = [
  {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    password: "admin123", // In a real app, this would be hashed
    role: "admin",
    avatar: "/placeholder.svg?height=100&width=100&text=Admin",
    createdAt: "2023-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    username: "user1",
    email: "user1@example.com",
    password: "password123", // In a real app, this would be hashed
    role: "user",
    avatar: "/placeholder.svg?height=100&width=100&text=User1",
    createdAt: "2023-01-02T00:00:00.000Z",
  },
]

export const mockComments = [
  {
    id: 1,
    mangaId: 1,
    chapterId: 1,
    userId: 2,
    content: "This is an amazing first chapter!",
    createdAt: "2023-01-01T12:00:00.000Z",
  },
  {
    id: 2,
    mangaId: 1,
    chapterId: 1,
    userId: 1,
    content: "I agree, it sets up the story perfectly.",
    createdAt: "2023-01-01T13:00:00.000Z",
    parentId: 1,
  },
]

