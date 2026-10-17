import { useState, useMemo } from "react"
import { useAddChildToUnion, useFamilyMembers, useFamilyTree } from "../../hooks/useFamilyTree"
import { useModalStore } from "@/store/useModalStore"
import { useAuthStore } from "@/store/useAuthStore"
import { downgradeGuestToViewer } from "@/services/api"
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

  const { data: treeData } = useFamilyTree(familyId)
  const { data: members, isLoading } = useFamilyMembers(familyId)
  const { user } = useAuthStore()
  const { mutateAsync: addChild, isPending } = useAddChildToUnion()
  const { showModal } = useModalStore()

  // Membres déjà enregistrés comme enfant d'une union
  const existingChildIds = useMemo(() => {
    return new Set(treeData?.children?.map((c: any) => c.child_id) || [])
  }, [treeData])

  // Parents de l'union actuelle
  const currentUnion = treeData?.unions?.find((u: any) => u.id === unionId)
  const parentIds = useMemo(() => {
    return new Set([currentUnion?.partner_1_id, currentUnion?.partner_2_id].filter(Boolean))
  }, [currentUnion])

  const handleLinkExisting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!childId) return

    if (existingChildIds.has(childId)) {
      showModal('error', 'Filiation unique', "Ce membre est déjà enregistré comme enfant d'une union.")
      return
    }

    if (parentIds.has(childId)) {
      showModal('error', 'Filiation invalide', "Un parent ne peut pas être sélectionné comme son propre enfant.")
      return
    }

    const selectedChild = members?.find((m: any) => m.id === childId)
    if (selectedChild?.birth_date && treeData) {
      const union = treeData.unions?.find((u: any) => u.id === unionId)
      if (union) {
        const p1 = treeData.persons?.find((p: any) => p.id === union.partner_1_id)
        const p2 = treeData.persons?.find((p: any) => p.id === union.partner_2_id)
        const childBirth = new Date(selectedChild.birth_date)

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
      await addChild({
        family_id: familyId,
        union_id: unionId,
        child_id: childId
      })
      if (wasEditorGuest) {
        showModal('success', 'Naissance ajoutée', 'L\'enfant a été lié avec succès. Votre accès d\'édition unique est désormais terminé (mode Lecteur).')
      } else {
        showModal('success', 'Naissance ajoutée', 'L\'enfant a été lié à cette union avec succès.')
      }
      onClose()
    } catch (error: any) {
      console.error(error)
      const detail = error.response?.data?.detail || error.response?.data?.message || "Impossible d'ajouter l'enfant."
      showModal('error', 'Oups', detail)
    }
  }

  const handleCancel = async () => {
    if (user?.is_guest && user?.role === "EDITOR") {
      await downgradeGuestToViewer()
      showModal('info', 'Accès Lecteur', "Votre droit d'ajout unique a été révoqué suite à l'annulation. Vous êtes désormais en mode lecture seule.")
    }
    onClose()
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
        <CreateMemberForm familyId={familyId} parentUnionId={unionId} onClose={handleCancel} />
      )}
      
      {activeTab === "existing" && (
        <form onSubmit={handleLinkExisting} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Sélectionner l'enfant</Label>
            {(() => {
              const availableMembers = members?.filter((m: any) => !existingChildIds.has(m.id) && !parentIds.has(m.id)) || []
              if (availableMembers.length === 0) {
                return (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-md border border-amber-200">
                    Tous les membres actuels sont déjà rattachés à une union parentale ou sont les parents de cette union. Vous pouvez créer un nouvel enfant dans l'onglet « Créer un enfant ».
                  </p>
                )
              }
              return (
                <select 
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={childId}
                  onChange={e => setChildId(e.target.value)}
                >
                  <option value="">Sélectionner un membre...</option>
                  {availableMembers.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                  ))}
                </select>
              )
            })()}
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={handleCancel}>Annuler</Button>
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
