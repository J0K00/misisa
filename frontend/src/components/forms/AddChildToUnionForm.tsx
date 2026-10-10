import { useState } from "react"
import { useAddChildToUnion, useFamilyMembers } from "../../hooks/useFamilyTree"
import { useModalStore } from "@/store/useModalStore"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { CreateMemberForm } from "./CreateMemberForm"

interface Props {
  familyId: string
  unionId: string
  onClose: () => void
}

export function AddChildToUnionForm({ familyId, unionId, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"new" | "existing">("new")
  const [childId, setChildId] = useState("")

  const { data: members, isLoading } = useFamilyMembers(familyId)
  const { mutateAsync: addChild, isPending } = useAddChildToUnion()
  const { showModal } = useModalStore()

  const handleLinkExisting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!childId) return

    try {
      await addChild({
        family_id: familyId,
        union_id: unionId,
        child_id: childId
      })
      showModal('success', 'Naissance ajoutée', 'L\'enfant a été lié à cette union avec succès.')
      onClose()
    } catch (error) {
      console.error(error)
      showModal('error', 'Oups', 'Impossible d\'ajouter l\'enfant.')
    }
  }

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin mx-auto" />

  return (
    <div className="w-full">
      <div className="flex bg-stone-100 p-1 rounded-lg mb-4">
        <button 
          onClick={() => setActiveTab("new")}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "new" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
        >
          Créer un enfant
        </button>
        <button 
          onClick={() => setActiveTab("existing")}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "existing" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
        >
          Lier un membre existant
        </button>
      </div>
      
      {activeTab === "new" && (
        <CreateMemberForm familyId={familyId} parentUnionId={unionId} onClose={onClose} />
      )}
      
      {activeTab === "existing" && (
        <form onSubmit={handleLinkExisting} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Sélectionner l'enfant</Label>
            <select 
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={childId}
              onChange={e => setChildId(e.target.value)}
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
      )}
    </div>
  )
}
