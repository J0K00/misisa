import { useState } from "react"
import { useCreatePerson, useFamilyTree } from "../../hooks/useFamilyTree"
import { useModalStore } from "@/store/useModalStore"
import { useAuthStore } from "@/store/useAuthStore"
import { downgradeGuestToViewer } from "@/services/api"
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

  const [selectedParentUnion, setSelectedParentUnion] = useState<string>(parentUnionId || "")
  const { data: treeData } = useFamilyTree(familyId)
  const { user } = useAuthStore()
  const { mutateAsync: createPerson, isPending } = useCreatePerson()
  const { showModal } = useModalStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.first_name || !formData.last_name || !formData.birth_date || !formData.gender) return

    const effectiveParentUnionId = selectedParentUnion || parentUnionId || undefined

    // Validation des règles d'âge si rattaché à une union parente
    if (effectiveParentUnionId && treeData) {
      const union = treeData.unions?.find((u: any) => u.id === effectiveParentUnionId)
      if (union) {
        const p1 = treeData.persons?.find((p: any) => p.id === union.partner_1_id)
        const p2 = treeData.persons?.find((p: any) => p.id === union.partner_2_id)
        const childBirth = new Date(formData.birth_date)

        for (const parent of [p1, p2]) {
          if (parent?.birth_date) {
            const parentBirth = new Date(parent.birth_date)
            if (childBirth <= parentBirth) {
              showModal('error', 'Âge invalide', `L'enfant ne peut pas être plus âgé ou né avant son parent (${parent.first_name} ${parent.last_name}).`)
              return
            }
          }
        }

        const mother = p1?.gender === 'F' ? p1 : (p2?.gender === 'F' ? p2 : null)
        if (mother?.birth_date) {
          const motherBirth = new Date(mother.birth_date)
          let gapYears = childBirth.getFullYear() - motherBirth.getFullYear()
          if (
            childBirth.getMonth() < motherBirth.getMonth() ||
            (childBirth.getMonth() === motherBirth.getMonth() && childBirth.getDate() < motherBirth.getDate())
          ) {
            gapYears -= 1
          }
          if (gapYears < 12) {
            showModal(
              'error',
              'Écart d\'âge biologique impossible',
              "Un enfant ne peut pas naître avec un écart de moins de 12 ans par rapport à sa mère (bien que le record historique documenté soit Lina Medina à 5 ans et 7 mois, le seuil minimum requis ici est de 12 ans)."
            )
            return
          }
        }
      }
    }

    const wasEditorGuest = user?.is_guest && user?.role === "EDITOR"

    try {
      await createPerson({
        ...formData,
        family_id: familyId,
        parent_union_id: effectiveParentUnionId || null,
        death_date: formData.death_date || null
      })
      if (wasEditorGuest) {
        showModal('success', 'Membre ajouté !', 'Votre ajout unique a été enregistré avec succès. Votre accès est désormais en mode lecture seule (Lecteur).')
      } else {
        showModal('success', 'Membre ajouté !', 'Le nouveau membre a été ajouté à la famille avec succès.')
      }
      onClose()
    } catch (error: any) {
      console.error(error)
      const detail = error.response?.data?.detail || error.response?.data?.message || "Impossible d'ajouter le membre."
      showModal('error', 'Erreur', detail)
    }
  }

  const handleCancel = async () => {
    if (user?.is_guest && user?.role === "EDITOR") {
      await downgradeGuestToViewer()
      showModal('info', 'Accès Lecteur', "Votre droit d'ajout unique a été révoqué suite à l'annulation. Vous êtes désormais en mode lecture seule.")
    }
    onClose()
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
        <Label>Filiation / Parents (optionnel)</Label>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={selectedParentUnion}
          onChange={e => setSelectedParentUnion(e.target.value)}
          disabled={!!parentUnionId}
        >
          <option value="">Aucune filiation (Membre racine / Conjoint)</option>
          {treeData?.unions?.map((u: any) => {
            const p1 = treeData.persons?.find((p: any) => p.id === u.partner_1_id)
            const p2 = treeData.persons?.find((p: any) => p.id === u.partner_2_id)
            const label = p1 && p2 
              ? `Enfant de ${p1.first_name} ${p1.last_name} & ${p2.first_name} ${p2.last_name}` 
              : `Union ${u.id}`
            return (
              <option key={u.id} value={u.id}>
                {label}
              </option>
            )
          })}
        </select>
        <p className="text-xs text-stone-500">
          Sélectionnez l'union parentale dont est issu ce membre (laisser vide si c'est un membre racine ou un conjoint).
        </p>
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
        <Button variant="ghost" type="button" onClick={handleCancel}>Annuler</Button>
        <Button type="submit" disabled={isPending} className="bg-[#3B2314] hover:bg-[#2A2421] text-white">
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Enregistrer
        </Button>
      </div>
    </form>
  )
}
