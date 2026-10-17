import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../../services/api"
import { useModalStore } from "@/store/useModalStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface Props {
  member: any
  familyId: string
  onClose: () => void
}

export function EditMemberForm({ member, familyId, onClose }: Props) {
  const [formData, setFormData] = useState({
    first_name: member.first_name || "",
    last_name: member.last_name || "",
    birth_date: member.birth_date ? String(member.birth_date).slice(0, 10) : "",
    death_date: member.death_date ? String(member.death_date).slice(0, 10) : "",
    gender: member.gender || "M",
    bio: member.bio || ""
  })

  const queryClient = useQueryClient()
  const { showModal } = useModalStore()

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put(`/persons/${member.id}`, payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyTree", familyId] })
      queryClient.invalidateQueries({ queryKey: ["familyMembers", familyId] })
      showModal("success", "Membre mis à jour", "Les informations du membre ont été modifiées avec succès.")
      onClose()
    },
    onError: (err: any) => {
      showModal("error", "Erreur", err.response?.data?.detail || "Impossible de modifier ce membre.")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({
      ...formData,
      death_date: formData.death_date || null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Prénom</Label>
          <Input 
            required 
            value={formData.first_name}
            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Nom</Label>
          <Input 
            required 
            value={formData.last_name}
            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Date de naissance</Label>
          <Input 
            type="date" 
            required
            value={formData.birth_date}
            onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Date de décès (optionnel)</Label>
          <Input 
            type="date"
            value={formData.death_date}
            onChange={e => setFormData({ ...formData, death_date: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Genre</Label>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={formData.gender}
          onChange={e => setFormData({ ...formData, gender: e.target.value })}
        >
          <option value="M">Homme</option>
          <option value="F">Femme</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label>Biographie</Label>
        <textarea 
          className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Racontez son histoire..."
          value={formData.bio}
          onChange={e => setFormData({ ...formData, bio: e.target.value })}
        />
      </div>

      <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
        <Button variant="ghost" type="button" onClick={onClose}>Annuler</Button>
        <Button type="submit" disabled={updateMutation.isPending} className="bg-[#3B2314] hover:bg-[#2A2421] text-white">
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  )
}
