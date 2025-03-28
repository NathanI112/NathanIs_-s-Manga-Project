"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Search, Menu, BookOpen, Clock, FlameIcon as Fire, Compass, Tag, Home } from "lucide-react"
import { UserNav } from "@/components/user-nav"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden flex-shrink-0"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menüyü Aç</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px] mobile-nav">
              <div className="flex flex-col gap-4 py-4">
                <Link href="/" className="flex items-center gap-2 px-4" onClick={() => setIsMobileMenuOpen(false)}>
                  <Image src="/placeholder.svg?height=32&width=32" alt="Logo" width={32} height={32} />
                  <span className="text-xl font-bold">MangaVerse</span>
                </Link>
                <div className="px-4">
                  <form
                    onSubmit={(e) => {
                      handleSearch(e)
                      setIsMobileMenuOpen(false)
                    }}
                    className="relative"
                  >
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Manga ara..."
                      className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                </div>
                <nav className="flex flex-col">
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home className="h-4 w-4" />
                    <span>Ana Sayfa</span>
                  </Link>
                  <Link
                    href="/manga"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Tüm Mangalar</span>
                  </Link>
                  <Link
                    href="/latest"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Clock className="h-4 w-4" />
                    <span>En Yeniler</span>
                  </Link>
                  <Link
                    href="/popular"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Fire className="h-4 w-4" />
                    <span>Popüler</span>
                  </Link>
                  <Link
                    href="/genres"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Tag className="h-4 w-4" />
                    <span>Kategoriler</span>
                  </Link>
                  <Link
                    href="/random"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Compass className="h-4 w-4" />
                    <span>Rastgele</span>
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="Logo"
              width={32}
              height={32}
              className="flex-shrink-0"
            />
            <span className="text-xl font-bold hidden sm:inline">MangaVerse</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 overflow-x-auto">
          <Link href="/" className="text-sm font-medium whitespace-nowrap">
            Ana Sayfa
          </Link>
          <Link href="/manga" className="text-sm font-medium whitespace-nowrap">
            Tüm Mangalar
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-medium cursor-pointer whitespace-nowrap">
              Kategoriler
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Popüler Kategoriler</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/genres/action">Aksiyon</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/genres/adventure">Macera</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/genres/fantasy">Fantezi</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/genres/romance">Romantik</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/genres/comedy">Komedi</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/genres">Tüm Kategoriler</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/latest" className="text-sm font-medium whitespace-nowrap">
            En Yeniler
          </Link>
          <Link href="/popular" className="text-sm font-medium whitespace-nowrap">
            Popüler
          </Link>
          <Link href="/random" className="text-sm font-medium whitespace-nowrap">
            Rastgele
          </Link>
        </nav>
        <div className="flex items-center gap-2 md:gap-4">
          <form onSubmit={handleSearch} className="relative hidden md:flex items-center">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Manga ara..."
              className="w-full max-w-[200px] lg:max-w-xs rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="sm" variant="default" className="ml-2 hidden lg:inline-flex">
              Ara
            </Button>
          </form>
          <UserNav />
        </div>
      </div>
    </header>
  )
}

