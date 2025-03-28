import Script from "next/script"
import Head from "next/head"

interface ChapterSEOProps {
  manga: {
    id: number
    title: string
  }
  chapter: {
    number: number
    title: string
  }
  url: string
  prevChapterUrl?: string
  nextChapterUrl?: string
}

export default function ChapterSEO({ manga, chapter, url, prevChapterUrl, nextChapterUrl }: ChapterSEOProps) {
  const keywords = [
    `${manga.title} chapter ${chapter.number}`,
    `read ${manga.title} chapter ${chapter.number}`,
    `${manga.title} ${chapter.title}`,
    `${manga.title} manga chapter ${chapter.number}`,
    `${manga.title} latest chapter`,
    `${manga.title} free online`,
  ].join(", ")

  return (
    <>
      <Head>
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={url} />
        {prevChapterUrl && <link rel="prev" href={prevChapterUrl} />}
        {nextChapterUrl && <link rel="next" href={nextChapterUrl} />}
      </Head>

      {/* Structured Data for Chapter */}
      <Script
        id="chapter-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Chapter",
            name: `Chapter ${chapter.number}: ${chapter.title}`,
            isPartOf: {
              "@type": "CreativeWork",
              name: manga.title,
              url: `https://mangaverse.example.com/manga/${manga.id}`,
            },
            position: chapter.number,
            url: url,
            pagination: {
              previousPage: prevChapterUrl,
              nextPage: nextChapterUrl,
            },
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
                item: `https://mangaverse.example.com/manga/${manga.id}`,
              },
              {
                "@type": "ListItem",
                position: 4,
                name: `Chapter ${chapter.number}`,
                item: url,
              },
            ],
          }),
        }}
      />
    </>
  )
}

