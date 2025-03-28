import Script from "next/script"
import Head from "next/head"

interface MangaSEOProps {
  manga: {
    id: number
    title: string
    description: string
    cover: string
    author: string
    artist: string
    status: string
    releaseYear: number
    rating: number
    genres: string[]
  }
  url: string
}

export default function MangaSEO({ manga, url }: MangaSEOProps) {
  // Format genres for keywords
  const keywords = [
    manga.title,
    `read ${manga.title}`,
    `${manga.title} manga`,
    `${manga.title} online`,
    manga.author,
    ...manga.genres.map((genre) => `${genre} manga`),
    ...manga.genres.map((genre) => `${manga.title} ${genre}`),
    `${manga.status.toLowerCase()} manga`,
  ].join(", ")

  return (
    <>
      <Head>
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={url} />
      </Head>

      {/* Structured Data for Manga (Creative Work) */}
      <Script
        id="manga-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: manga.title,
            description: manga.description,
            image: manga.cover,
            author: {
              "@type": "Person",
              name: manga.author,
            },
            creator: {
              "@type": "Person",
              name: manga.artist,
            },
            datePublished: `${manga.releaseYear}`,
            genre: manga.genres,
            publisher: "MangaVerse",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: manga.rating,
              bestRating: "5",
              worstRating: "1",
              ratingCount: "1000",
            },
            url: url,
          }),
        }}
      />

      {/* Structured Data for Breadcrumbs */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://mangaverse.example.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Manga",
                item: "https://mangaverse.example.com/manga",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: manga.title,
                item: url,
              },
            ],
          }),
        }}
      />
    </>
  )
}

