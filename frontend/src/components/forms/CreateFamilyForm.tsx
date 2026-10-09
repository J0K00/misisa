import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCreateFamily } from "../../hooks/useFamilyTree"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useModalStore } from "@/store/useModalStore"

export function CreateFamilyForm({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState("")
  const { mutateAsync: createFamily, isPending } = useCreateFamily()
  const { showModal } = useModalStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      const newFamily = await createFamily(name)
      showModal('success', 'Super !', 'Votre famille a été créée avec succès.')
      if (onSuccess) {
        onSuccess()
      } else {
        // Redirige vers le nouvel arbre par défaut
        navigate(`/family/${newFamily.id}`)
      }
    } catch (error) {
      console.error("Erreur lors de la création", error)
      showModal('error', 'Oups !', 'Impossible de créer la famille.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="familyName">Nom de la famille</Label>
        <Input 
          id="familyName" 
          placeholder="Ex: Famille Dupont" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={!name.trim() || isPending} className="w-full">
        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        Créer l'arbre
      </Button>
    </form>
  )
}
