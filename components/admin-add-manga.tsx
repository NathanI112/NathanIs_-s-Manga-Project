"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminAddManga() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    alternativeTitles: "",
    author: "",
    artist: "",
    description: "",
    status: "ongoing",
    releaseYear: "",
    genres: [] as string[],
    isAdult: false,
  })
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [bannerImage, setBannerImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [quickAddMode, setQuickAddMode] = useState(false)

  const genres = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Sports",
    "Supernatural",
    "Thriller",
    "Seinen",
    "Shounen",
    "Shoujo",
    "Josei",
    "Ecchi",
    "Harem",
    "Isekai",
    "Mecha",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleGenreChange = (genre: string) => {
    setFormData((prev) => {
      const updatedGenres = prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre]

      return {
        ...prev,
        genres: updatedGenres,
      }
    })
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Dosya çok büyük",
        description: "Kapak resmi 2MB'den küçük olmalıdır",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Geçersiz dosya türü",
        description: "Lütfen bir resim dosyası yükleyin (JPG, PNG, WEBP)",
        variant: "destructive",
      })
      return
    }

    setCoverImage(file)

    // Create a preview URL
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setCoverPreview(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Dosya çok büyük",
        description: "Banner resmi 2MB'den küçük olmalıdır",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Geçersiz dosya türü",
        description: "Lütfen bir resim dosyası yükleyin (JPG, PNG, WEBP)",
        variant: "destructive",
      })
      return
    }

    setBannerImage(file)

    // Create a preview URL
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setBannerPreview(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const toggleQuickAddMode = () => {
    setQuickAddMode(!quickAddMode)

    if (!quickAddMode) {
      toast({
        title: "Hızlı Ekleme Modu Açık",
        description: "Sadece başlık gereklidir. Diğer alanlar isteğe bağlıdır.",
      })
    } else {
      toast({
        title: "Hızlı Ekleme Modu Kapalı",
        description: "Tüm gerekli alanlar doldurulmalıdır.",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Skip validation in quick add mode if title is provided
    if (quickAddMode) {
      if (!formData.title) {
        toast({
          title: "Başlık eksik",
          description: "Lütfen bir manga başlığı girin",
          variant: "destructive",
        })
        return
      }
    } else {
      // Full validation for normal mode
      if (!formData.title) {
        toast({
          title: "Başlık eksik",
          description: "Lütfen bir manga başlığı girin",
          variant: "destructive",
        })
        return
      }

      if (!coverImage && !coverPreview) {
        toast({
          title: "Kapak resmi eksik",
          description: "Lütfen bir kapak resmi yükleyin",
          variant: "destructive",
        })
        return
      }

      if (formData.genres.length === 0) {
        toast({
          title: "Tür seçilmedi",
          description: "Lütfen en az bir tür seçin",
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Create manga object
      const newManga = {
        title: formData.title,
        alternativeTitles: formData.alternativeTitles,
        author: formData.author || "Bilinmiyor",
        artist: formData.artist || formData.author || "Bilinmiyor",
        description: formData.description || `${formData.title} mangasını ücretsiz oku.`,
        status: formData.status as "ongoing" | "completed" | "hiatus" | "cancelled",
        releaseYear: formData.releaseYear ? Number.parseInt(formData.releaseYear) : new Date().getFullYear(),
        genres: formData.genres.length > 0 ? formData.genres : ["Action"],
        isAdult: formData.isAdult,
        cover: coverPreview || "/placeholder.svg?height=400&width=300",
        banner: bannerPreview || undefined,
        rating: 0,
        views: 0,
        createdAt: new Date().toISOString(),
      }

      // API'ye gönder
      const response = await fetch("/api/manga", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newManga),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Manga eklenirken bir hata oluştu")
      }

      const result = await response.json()

      toast({
        title: "Başarılı",
        description: `"${formData.title}" başarıyla eklendi!`,
      })

      // Reset form
      setFormData({
        title: "",
        alternativeTitles: "",
        author: "",
        artist: "",
        description: "",
        status: "ongoing",
        releaseYear: "",
        genres: [],
        isAdult: false,
      })
      setCoverImage(null)
      setBannerImage(null)
      setCoverPreview(null)
      setBannerPreview(null)
    } catch (error) {
      console.error("Manga kaydedilirken hata:", error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Manga eklenemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant={quickAddMode ? "default" : "outline"} onClick={toggleQuickAddMode} className="gap-2">
            <Plus className="h-4 w-4" />
            {quickAddMode ? "Hızlı Ekleme Modu: AÇIK" : "Hızlı Ekleme Modu: KAPALI"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {quickAddMode ? "Sadece başlık gerekli" : "Tüm gerekli alanlar doldurulmalı"}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
            <TabsTrigger value="details">Detaylar</TabsTrigger>
            <TabsTrigger value="images">Görseller</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık (Gerekli)</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="örn. One Piece"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternativeTitles">Alternatif Başlıklar</Label>
                <Input
                  id="alternativeTitles"
                  name="alternativeTitles"
                  value={formData.alternativeTitles}
                  onChange={handleChange}
                  placeholder="örn. ワンピース (virgülle ayırın)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="author">Yazar</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="örn. Eiichiro Oda"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist">Çizer</Label>
                <Input
                  id="artist"
                  name="artist"
                  value={formData.artist}
                  onChange={handleChange}
                  placeholder="örn. Eiichiro Oda"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="releaseYear">Yayın Yılı</Label>
                <Input
                  id="releaseYear"
                  name="releaseYear"
                  type="number"
                  value={formData.releaseYear}
                  onChange={handleChange}
                  placeholder="örn. 1999"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Devam Ediyor</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="hiatus">Ara Verildi</SelectItem>
                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isAdult">Yetişkin İçerik</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isAdult"
                      checked={formData.isAdult}
                      onCheckedChange={(checked) => {
                        setFormData((prev) => ({
                          ...prev,
                          isAdult: checked === true,
                        }))
                      }}
                    />
                    <label
                      htmlFor="isAdult"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Bu manga yetişkin içerik barındırıyor
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Türler {!quickAddMode && "(Gerekli)"}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {genres.map((genre) => (
                  <div key={genre} className="flex items-center space-x-2">
                    <Checkbox
                      id={`genre-${genre}`}
                      checked={formData.genres.includes(genre)}
                      onCheckedChange={() => handleGenreChange(genre)}
                    />
                    <label
                      htmlFor={`genre-${genre}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {genre}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Manga hakkında kısa bir açıklama yazın..."
                rows={5}
              />
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cover Image Upload */}
              <div>
                <Label className="mb-2 block">Kapak Resmi {!quickAddMode && "(Gerekli)"}</Label>
                <div className="flex flex-col items-center">
                  <Card className="w-full max-w-[200px] border-dashed">
                    <CardContent className="p-0">
                      <label className="flex flex-col items-center justify-center w-full h-[280px] cursor-pointer">
                        {coverPreview ? (
                          <div className="relative w-full h-full">
                            <img
                              src={coverPreview || "/placeholder.svg"}
                              alt="Cover preview"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={(e) => {
                                e.preventDefault()
                                setCoverImage(null)
                                setCoverPreview(null)
                              }}
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Kapağı kaldır</span>
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Kapak yüklemek için tıklayın</p>
                            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP (Maks 2MB)</p>
                          </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
                      </label>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Banner Image Upload */}
              <div>
                <Label className="mb-2 block">Banner Resmi (İsteğe Bağlı)</Label>
                <div className="flex flex-col items-center">
                  <Card className="w-full border-dashed">
                    <CardContent className="p-0">
                      <label className="flex flex-col items-center justify-center w-full h-[140px] cursor-pointer">
                        {bannerPreview ? (
                          <div className="relative w-full h-full">
                            <img
                              src={bannerPreview || "/placeholder.svg"}
                              alt="Banner preview"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={(e) => {
                                e.preventDefault()
                                setBannerImage(null)
                                setBannerPreview(null)
                              }}
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Banner'ı kaldır</span>
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Banner yüklemek için tıklayın</p>
                            <p className="text-xs text-muted-foreground mt-1">Önerilen boyut: 1200x400px</p>
                          </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleBannerChange} />
                      </label>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? (
              <>Gönderiliyor...</>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Manga Ekle
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

