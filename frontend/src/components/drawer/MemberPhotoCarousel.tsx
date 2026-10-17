import { useState, useRef } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Trash2, Upload, Loader2, ImagePlus } from "lucide-react"

export interface PersonPhoto {
  id: string
  url: string
  public_id: string
}

export function MemberPhotoCarousel({ 
  personId: _personId,
  canUploadPhotos = false,
  showHeader = true
}: { 
  personId: string
  canUploadPhotos?: boolean
  showHeader?: boolean
}) {
  const [photos, setPhotos] = useState<PersonPhoto[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUploadPhotos) return
    const file = e.target.files?.[0]
    if (!file) return

    if (photos.length >= 10) {
      alert("Limite de 10 photos atteinte pour ce membre.")
      return
    }

    setIsUploading(true)
    try {
      const mockUrl = URL.createObjectURL(file)
      const newPhoto: PersonPhoto = {
        id: crypto.randomUUID(),
        url: mockUrl,
        public_id: "mock_public_id",
      }
      setPhotos(prev => [...prev, newPhoto])
    } catch (error) {
      console.error(error)
      alert("Une erreur est survenue lors de l'upload de l'image.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDelete = (photoId: string) => {
    if (!canUploadPhotos) return
    setPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-serif text-xl text-stone-900 border-b border-stone-200 w-full pb-1.5">
            Souvenirs ({photos.length}/10)
          </h3>
        </div>
      )}

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-stone-400 bg-stone-50/80 rounded-xl border border-dashed border-stone-200 gap-1.5">
          <ImagePlus className="w-7 h-7 text-stone-400" />
          <p className="text-xs">
            {canUploadPhotos ? "Aucune photo ajoutée. Cliquez ci-dessous pour en ajouter." : "Aucun souvenir photo disponible."}
          </p>
        </div>
      ) : (
        <div className="relative px-6">
          <Carousel className="w-full">
            <CarouselContent>
              {photos.map((photo, index) => (
                <CarouselItem key={photo.id}>
                  <div className="relative group p-1 h-[220px]">
                    <div className="w-full h-full overflow-hidden rounded-xl border border-stone-200 shadow-sm bg-stone-100">
                      <img 
                        src={photo.url} 
                        alt={`Souvenir ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {canUploadPhotos && (
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full shadow-sm"
                        onClick={() => handleDelete(photo.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {photos.length > 1 && (
              <>
                <CarouselPrevious className="left-0 h-7 w-7" />
                <CarouselNext className="right-0 h-7 w-7" />
              </>
            )}
          </Carousel>
        </div>
      )}

      {canUploadPhotos && (
        <div className="flex justify-center mt-3">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            disabled={photos.length >= 10 || isUploading}
          />
          <Button 
            variant="outline" 
            size="sm"
            disabled={photos.length >= 10 || isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl text-xs py-2"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 mr-1.5" />
            )}
            {isUploading ? "Ajout en cours..." : "Ajouter un souvenir photo"}
          </Button>
        </div>
      )}
    </div>
  )
}
