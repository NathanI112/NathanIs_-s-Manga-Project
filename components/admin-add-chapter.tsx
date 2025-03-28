"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Plus, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminAddChapter() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    mangaId: "",
    chapterNumber: "",
    title: "",
    description: "",
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mangaOptions, setMangaOptions] = useState<Array<{ id: number | string; title: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  // Manga listesini yükle
  useEffect(() => {
    const loadMangaList = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/manga")
        if (!response.ok) {
          throw new Error("Manga listesi alınamadı")
        }

        const data = await response.json()
        setMangaOptions(
          data.map((manga: any) => ({
            id: manga.id,
            title: manga.title,
          })),
        )
      } catch (error) {
        console.error("Manga listesi yüklenirken hata:", error)
        toast({
          title: "Hata",
          description: "Manga listesi yüklenemedi",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadMangaList()
  }, [toast])

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const reorderFiles = () => {
    // Sort files by name (assuming they're named with numbers)
    const sorted = [...uploadedFiles].sort((a, b) => {
      const nameA = a.name.toLowerCase()
      const nameB = b.name.toLowerCase()
      return nameA.localeCompare(nameB, undefined, { numeric: true })
    })
    setUploadedFiles(sorted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.mangaId) {
      toast({
        title: "Hata",
        description: "Lütfen bir manga seçin",
        variant: "destructive",
      })
      return
    }

    if (!formData.chapterNumber) {
      toast({
        title: "Hata",
        description: "Lütfen bir bölüm numarası girin",
        variant: "destructive",
      })
      return
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen en az bir sayfa yükleyin",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Dosyaları işle ve URL'leri oluştur
      // Gerçek bir uygulamada, dosyaları bir depolama hizmetine yüklersiniz
      // Burada, placeholder URL'ler oluşturuyoruz
      const pageUrls = uploadedFiles.map(
        (_, index) => `/placeholder.svg?height=1400&width=900&text=Bölüm ${formData.chapterNumber} Sayfa ${index + 1}`,
      )

      // Bölüm nesnesini oluştur
      const newChapter = {
        mangaId: Number(formData.mangaId),
        chapterNumber: formData.chapterNumber,
        title: formData.title || `Bölüm ${formData.chapterNumber}`,
        description: formData.description,
        pages: uploadedFiles.length,
        pageUrls: pageUrls,
        uploadDate: new Date().toISOString().split("T")[0],
        views: 0,
        status: "published" as const,
      }

      // API'ye gönder
      const response = await fetch("/api/chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newChapter),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Bölüm eklenirken bir hata oluştu")
      }

      const result = await response.json()

      toast({
        title: "Başarılı",
        description: `Bölüm ${formData.chapterNumber} başarıyla eklendi!`,
      })

      // Formu sıfırla
      setFormData({
        mangaId: "",
        chapterNumber: "",
        title: "",
        description: "",
      })
      setUploadedFiles([])
    } catch (error) {
      console.error("Bölüm kaydedilirken hata:", error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Bölüm eklenemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="mangaId">Manga</Label>
          <Select value={formData.mangaId} onValueChange={(value) => handleSelectChange("mangaId", value)}>
            <SelectTrigger id="mangaId">
              <SelectValue placeholder="Manga seçin" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Yükleniyor...
                </SelectItem>
              ) : mangaOptions.length > 0 ? (
                mangaOptions.map((manga) => (
                  <SelectItem key={manga.id} value={manga.id.toString()}>
                    {manga.title}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="empty" disabled>
                  Manga bulunamadı
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chapterNumber">Bölüm Numarası</Label>
          <Input
            id="chapterNumber"
            name="chapterNumber"
            type="number"
            placeholder="örn. 42"
            value={formData.chapterNumber}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Bölüm Başlığı (İsteğe Bağlı)</Label>
        <Input id="title" name="title" placeholder="örn. Son Savaş" value={formData.title} onChange={handleChange} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Açıklama (İsteğe Bağlı)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Bu bölüm hakkında kısa bir açıklama..."
          rows={3}
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label>Sayfaları Yükle</Label>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Resimleri doğru sırada yükleyin. Desteklenen formatlar: JPG, PNG, WEBP
          </p>
          {uploadedFiles.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={reorderFiles}>
              İsme Göre Sırala
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {/* File upload card */}
          <Card className="border-dashed">
            <CardContent className="p-0">
              <label className="flex flex-col items-center justify-center w-full h-[140px] cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Yüklemek için tıklayın</p>
                </div>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
              </label>
            </CardContent>
          </Card>

          {/* Uploaded files */}
          {uploadedFiles.map((file, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-0">
                <div className="relative h-[140px] w-full">
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file) || "/placeholder.svg"}
                        alt={`Sayfa ${index + 1}`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Dosyayı kaldır</span>
                  </Button>
                  <div className="absolute bottom-1 left-1 bg-background/80 text-xs px-2 py-1 rounded">
                    Sayfa {index + 1}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? (
          <>Yükleniyor...</>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Bölüm Ekle
          </>
        )}
      </Button>
    </form>
  )
}

