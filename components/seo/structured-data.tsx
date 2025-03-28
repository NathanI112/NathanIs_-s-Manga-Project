import Script from "next/script"

interface WebsiteStructuredDataProps {
  siteUrl: string
}

export function WebsiteStructuredData({ siteUrl }: WebsiteStructuredDataProps) {
  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          url: siteUrl,
          name: "MangaVerse",
          description: "Read manga online for free",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${siteUrl}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }),
      }}
    />
  )
}

interface OrganizationStructuredDataProps {
  siteUrl: string
}

export function OrganizationStructuredData({ siteUrl }: OrganizationStructuredDataProps) {
  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "MangaVerse",
          url: siteUrl,
          logo: `${siteUrl}/logo.png`,
          sameAs: [
            "https://twitter.com/MangaVerse",
            "https://facebook.com/MangaVerse",
            "https://instagram.com/MangaVerse",
          ],
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+1-800-123-4567",
            contactType: "customer service",
            availableLanguage: ["English", "Japanese"],
          },
        }),
      }}
    />
  )
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string
    item: string
  }>
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const itemListElement = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.item,
  }))

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: itemListElement,
        }),
      }}
    />
  )
}

interface FAQStructuredDataProps {
  questions: Array<{
    question: string
    answer: string
  }>
}

export function FAQStructuredData({ questions }: FAQStructuredDataProps) {
  const mainEntity = questions.map((q) => ({
    "@type": "Question",
    name: q.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: q.answer,
    },
  }))

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: mainEntity,
        }),
      }}
    />
  )
}

