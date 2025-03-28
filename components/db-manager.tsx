"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Database, Upload, AlertTriangle } from "lucide-react"

export default function DatabaseManager() {
  const { toast } = useToast()
  const [isMigrating, setIsMigrating] = useState(false)
  const [isAddingSample, setIsAddingSample] = useState(false)

  const handleMigrateData = async () => {
    setIsMigrating(true)
    try {
      const response = await fetch("/api/migrate", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Veri taşıma işlemi başarısız oldu")
      }

      const result = await response.json()

      toast({
        title: "Başarılı",
        description: "localStorage'dan veriler başarıyla taşındı",
      })
    } catch (error) {
      console.error("Veri taşıma hatası:", error)
      toast({
        title: "Hata",
        description: "Veri taşıma işlemi sırasında bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsMigrating(false)
    }
  }

  const handleAddSampleData = async () => {
    setIsAddingSample(true)
    try {
      const response = await fetch("/api/migrate", {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Örnek veri ekleme işlemi başarısız oldu")
      }

      const result = await response.json()

      toast({
        title: "Başarılı",
        description: "Örnek veriler başarıyla eklendi",
      })
    } catch (error) {
      console.error("Örnek veri ekleme hatası:", error)
      toast({
        title: "Hata",
        description: "Örnek veri ekleme işlemi sırasında bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsAddingSample(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Veritabanı Yönetimi</CardTitle>
          <CardDescription>Veritabanı işlemlerini buradan yönetebilirsiniz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 border rounded-md bg-muted/20">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Veri Taşıma Uyarısı</p>
              <p className="text-sm text-muted-foreground">
                localStorage'dan IndexedDB'ye veri taşıma işlemi, mevcut verileri etkileyebilir. İşlem öncesi yedek
                almanız önerilir.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto flex items-center gap-2"
            onClick={handleMigrateData}
            disabled={isMigrating}
          >
            <Upload className="h-4 w-4" />
            {isMigrating ? "Veriler Taşınıyor..." : "localStorage'dan Verileri Taşı"}
          </Button>

          <Button
            variant="outline"
            className="w-full sm:w-auto flex items-center gap-2"
            onClick={handleAddSampleData}
            disabled={isAddingSample}
          >
            <Database className="h-4 w-4" />
            {isAddingSample ? "Veriler Ekleniyor..." : "Örnek Veriler Ekle"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

