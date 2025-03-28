import type React from "react"
import Header from "@/components/header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import Link from "next/link"

export default function PopularLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <div className="container py-6">
        <Breadcrumbs />
        {children}
      </div>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MangaVerse. Tüm hakları saklıdır.
          </p>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/about" className="text-muted-foreground hover:underline underline-offset-4">
              Hakkımızda
            </Link>
            <Link href="/faq" className="text-muted-foreground hover:underline underline-offset-4">
              SSS
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:underline underline-offset-4">
              Kullanım Şartları
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:underline underline-offset-4">
              Gizlilik Politikası
            </Link>
            <Link href="/dmca" className="text-muted-foreground hover:underline underline-offset-4">
              DMCA
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:underline underline-offset-4">
              İletişim
            </Link>
          </nav>
        </div>
        <div className="container mt-4 md:mt-2 pb-4 flex justify-center md:justify-end">
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com/mangaverse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-twitter"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
              <span className="sr-only">Twitter</span>
            </a>
            <a
              href="https://instagram.com/mangaverse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-instagram"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
              <span className="sr-only">Instagram</span>
            </a>
            <a
              href="https://discord.gg/mangaverse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-message-circle"
              >
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
              </svg>
              <span className="sr-only">Discord</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}

