import Link from "next/link"
import { Button } from "@/components/ui/button"
import FeaturedManga from "@/components/featured-manga"
import MangaGrid from "@/components/manga-grid"
import LayoutWithHeaderFooter from "@/components/layout-with-header-footer"

export default function Home() {
  return (
    <LayoutWithHeaderFooter showBreadcrumbs={false}>
      <main className="flex-1">
        <section className="py-6 md:py-10">
          <div className="container">
            <FeaturedManga />
          </div>
        </section>
        <section className="py-8 bg-muted/50">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Latest Updates</h2>
              <Link href="/latest">
                <Button variant="link">View All</Button>
              </Link>
            </div>
            <MangaGrid limit={12} />
          </div>
        </section>
        <section className="py-8">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Popular This Week</h2>
              <Link href="/popular">
                <Button variant="link">View All</Button>
              </Link>
            </div>
            <MangaGrid limit={6} />
          </div>
        </section>
      </main>
    </LayoutWithHeaderFooter>
  )
}

