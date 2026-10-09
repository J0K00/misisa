import { useState } from "react"
import { useCreateUnion, useFamilyMembers } from "../../hooks/useFamilyTree"
import { useModalStore } from "@/store/useModalStore"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface Props {
  familyId: string
  onClose: () => void
}

export function CreateUnionForm({ familyId, onClose }: Props) {
  const [partner1, setPartner1] = useState("")
  const [partner2, setPartner2] = useState("")

  const { data: members, isLoading } = useFamilyMembers(familyId)
  const { mutateAsync: createUnion, isPending } = useCreateUnion()
  const { showModal } = useModalStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partner1 || !partner2) return
    if (partner1 === partner2) {
      showModal('error', 'Erreur', 'Veuillez sélectionner deux membres différents.')
      return
    }

    try {
      await createUnion({
        family_id: familyId,
        partner_1_id: partner1,
        partner_2_id: partner2
      })
      showModal('success', 'Union créée !', 'L\'union a été ajoutée avec succès.')
      onClose()
    } catch (error) {
      console.error(error)
      showModal('error', 'Oups', 'Impossible de créer l\'union.')
    }
  }

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin mx-auto" />

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Premier partenaire</Label>
        <select 
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={partner1}
          onChange={e => setPartner1(e.target.value)}
        >
          <option value="">Sélectionner un membre...</option>
          {members?.map((m: any) => (
            <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
          ))}
        </select>
      </div>
      
      <div className="space-y-2">
        <Label>Second partenaire</Label>
        <select 
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={partner2}
          onChange={e => setPartner2(e.target.value)}
        >
          <option value="">Sélectionner un membre...</option>
          {members?.map((m: any) => (
            <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
          ))}
        </select>
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onClose}>Annuler</Button>
        <Button type="submit" disabled={isPending} className="bg-[#3B2314] hover:bg-[#2A2421] text-white">
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Lier
        </Button>
      </div>
    </form>
  )
}
