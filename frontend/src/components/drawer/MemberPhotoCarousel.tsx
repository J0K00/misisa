import { useState, useRef } from "react"
import { uploadImageToCloudinary } from "../../services/cloudinary"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Trash2, Upload, Loader2, ImagePlus } from "lucide-react"

export interface PersonPhoto {
  id: string
  url: string
  public_id: string
}

export function MemberPhotoCarousel({ personId }: { personId: string }) {
  const [photos, setPhotos] = useState<PersonPhoto[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (photos.length >= 10) {
      alert("Limite de 10 photos atteinte pour ce membre.")
      return
    }

    setIsUploading(true)
    try {
      // Pour l'instant, on mock l'upload pour voir le résultat visuel
      // En vrai on utiliserait const res = await uploadImageToCloudinary(file)
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
    // Phase 4 : backend DELETE route
    setPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-serif text-xl text-primary border-b border-border w-full pb-2">Souvenirs ({photos.length}/10)</h4>
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-card/50 rounded-lg border border-dashed border-border gap-2">
          <ImagePlus className="w-8 h-8 text-stone-800/40" />
          <p className="text-sm">Aucun souvenir ajouté</p>
        </div>
      ) : (
        <div className="relative px-8">
          <Carousel className="w-full">
            <CarouselContent>
              {photos.map((photo, index) => (
                <CarouselItem key={photo.id}>
                  <div className="relative group p-1 h-[250px]">
                    <div className="w-full h-full overflow-hidden rounded-md border border-border shadow-sm">
                      <img 
                        src={photo.url} 
                        alt={`Souvenir ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8"
                      onClick={() => handleDelete(photo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {photos.length > 0 && (
              <>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </>
            )}
          </Carousel>
        </div>
      )}

      <div className="flex justify-center mt-4">
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
          disabled={photos.length >= 10 || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-parchemin-100 hover:bg-card border-stone-800/20 text-stone-900"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {isUploading ? "Ajout en cours..." : "Ajouter une photo"}
        </Button>
      </div>
    </div>
  )
}
