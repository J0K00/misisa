import { useState } from "react"
import { useCreatePerson } from "../../hooks/useFamilyTree"
import { useModalStore } from "@/store/useModalStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface Props {
  familyId: string
  parentUnionId?: string
  onClose: () => void
}

export function CreateMemberForm({ familyId, parentUnionId, onClose }: Props) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    death_date: "",
    gender: "M",
    bio: ""
  })

  const { mutateAsync: createPerson, isPending } = useCreatePerson()
  const { showModal } = useModalStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.first_name || !formData.last_name || !formData.birth_date || !formData.gender) return

    try {
      await createPerson({
        ...formData,
        family_id: familyId,
        parent_union_id: parentUnionId,
        death_date: formData.death_date || null
      })
      showModal('success', 'Membre ajouté !', 'Le nouveau membre a été ajouté à la famille avec succès.')
      onClose()
    } catch (error) {
      console.error(error)
      showModal('error', 'Erreur', "Impossible d'ajouter le membre.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Prénom</Label>
          <Input 
            required 
            value={formData.first_name}
            onChange={e => setFormData({...formData, first_name: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label>Nom</Label>
          <Input 
            required 
            value={formData.last_name}
            onChange={e => setFormData({...formData, last_name: e.target.value})}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date de naissance</Label>
          <Input 
            type="date" 
            required
            value={formData.birth_date}
            onChange={e => setFormData({...formData, birth_date: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label>Date de décès (optionnel)</Label>
          <Input 
            type="date"
            value={formData.death_date}
            onChange={e => setFormData({...formData, death_date: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Genre</Label>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={formData.gender}
          onChange={e => setFormData({...formData, gender: e.target.value})}
        >
          <option value="M">Homme</option>
          <option value="F">Femme</option>
          <option value="O">Autre</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Biographie</Label>
        <textarea 
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Racontez son histoire..."
          value={formData.bio}
          onChange={e => setFormData({...formData, bio: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <Label>Photo de profil</Label>
        <Input 
          type="file" 
          accept="image/*"
          className="cursor-pointer"
          onChange={e => {
            // Placeholder: L'upload vers Cloudinary sera géré ici plus tard
            console.log("Fichier sélectionné", e.target.files)
          }}
        />
        <p className="text-xs text-stone-500">L'image sera automatiquement redimensionnée.</p>
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onClose}>Annuler</Button>
        <Button type="submit" disabled={isPending} className="bg-[#3B2314] hover:bg-[#2A2421] text-white">
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Enregistrer
        </Button>
      </div>
    </form>
  )
}
