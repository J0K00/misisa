import { useState, useMemo } from "react"
import { useCreateUnion, useFamilyMembers, useFamilyTree } from "../../hooks/useFamilyTree"
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

  const { data: treeData } = useFamilyTree(familyId)
  const { data: members, isLoading } = useFamilyMembers(familyId)
  const { mutateAsync: createUnion, isPending } = useCreateUnion()
  const { showModal } = useModalStore()

  const [search1, setSearch1] = useState("")
  const [search2, setSearch2] = useState("")
  const [open1, setOpen1] = useState(false)
  const [open2, setOpen2] = useState(false)

  const selectedP1 = members?.find((m: any) => m.id === partner1)
  const selectedP2 = members?.find((m: any) => m.id === partner2)

  // Ensemble des membres déjà engagés dans une union
  const alreadyPartneredIds = useMemo(() => {
    return new Set(
      treeData?.unions?.flatMap((u: any) => [u.partner_1_id, u.partner_2_id]) || []
    )
  }, [treeData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partner1 || !partner2) return
    if (partner1 === partner2) {
      showModal('error', 'Erreur', 'Veuillez sélectionner deux membres différents.')
      return
    }

    if (alreadyPartneredIds.has(partner1) || alreadyPartneredIds.has(partner2)) {
      showModal('error', 'Union unique', "Un membre ne peut faire partie que d'une seule union.")
      return
    }

    if (selectedP1 && selectedP2) {
      const genders = new Set([selectedP1.gender, selectedP2.gender])
      if (genders.size !== 2 || !genders.has('M') || !genders.has('F')) {
        showModal('error', 'Règle d\'union', 'L\'union doit se faire obligatoirement entre un homme et une femme.')
        return
      }
    }

    try {
      await createUnion({
        family_id: familyId,
        partner_1_id: partner1,
        partner_2_id: partner2
      })
      showModal('success', 'Union créée !', 'L\'union a été ajoutée avec succès.')
      onClose()
    } catch (error: any) {
      console.error(error)
      showModal('error', 'Erreur', error.response?.data?.detail || 'Impossible de créer l\'union.')
    }
  }

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin mx-auto" />

  const filteredMembers1 = members?.filter((m: any) => {
    if (alreadyPartneredIds.has(m.id)) return false
    const matchesName = `${m.first_name} ${m.last_name}`.toLowerCase().includes(search1.toLowerCase())
    if (!matchesName) return false
    if (selectedP2) {
      return m.gender !== selectedP2.gender && (m.gender === 'M' || m.gender === 'F')
    }
    return m.gender === 'M' || m.gender === 'F'
  })

  const filteredMembers2 = members?.filter((m: any) => {
    if (alreadyPartneredIds.has(m.id)) return false
    const matchesName = `${m.first_name} ${m.last_name}`.toLowerCase().includes(search2.toLowerCase())
    if (!matchesName) return false
    if (selectedP1) {
      return m.gender !== selectedP1.gender && (m.gender === 'M' || m.gender === 'F')
    }
    return m.gender === 'M' || m.gender === 'F'
  })

  const getMemberName = (id: string) => {
    const m = members?.find((m: any) => m.id === id)
    if (!m) return "Sélectionner un membre..."
    const genderTag = m.gender === 'M' ? ' (Homme)' : m.gender === 'F' ? ' (Femme)' : ''
    return `${m.first_name} ${m.last_name}${genderTag}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 relative">
        <Label>Premier partenaire</Label>
        <div 
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer"
          onClick={() => { setOpen1(!open1); setOpen2(false); setSearch1("") }}
        >
          {partner1 ? getMemberName(partner1) : "Sélectionner un membre..."}
        </div>
        {open1 && (
          <div className="absolute top-full left-0 w-full z-50 mt-1 bg-white border border-stone-200 rounded-md shadow-lg overflow-hidden">
            <input 
              autoFocus
              className="w-full px-3 py-2 text-sm border-b border-stone-100 outline-none"
              placeholder="Rechercher..."
              value={search1}
              onChange={e => setSearch1(e.target.value)}
            />
            <div className="max-h-48 overflow-y-auto">
              {filteredMembers1?.map((m: any) => (
                <div 
                  key={m.id} 
                  className="px-3 py-2 text-sm hover:bg-stone-50 cursor-pointer"
                  onClick={() => { setPartner1(m.id); setOpen1(false) }}
                >
                  {m.first_name} {m.last_name}
                </div>
              ))}
              {filteredMembers1?.length === 0 && (
                <div className="px-3 py-4 text-sm text-center text-stone-500">Aucun résultat</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-2 relative">
        <Label>Second partenaire</Label>
        <div 
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer"
          onClick={() => { setOpen2(!open2); setOpen1(false); setSearch2("") }}
        >
          {partner2 ? getMemberName(partner2) : "Sélectionner un membre..."}
        </div>
        {open2 && (
          <div className="absolute top-full left-0 w-full z-50 mt-1 bg-white border border-stone-200 rounded-md shadow-lg overflow-hidden">
            <input 
              autoFocus
              className="w-full px-3 py-2 text-sm border-b border-stone-100 outline-none"
              placeholder="Rechercher..."
              value={search2}
              onChange={e => setSearch2(e.target.value)}
            />
            <div className="max-h-48 overflow-y-auto">
              {filteredMembers2?.map((m: any) => (
                <div 
                  key={m.id} 
                  className="px-3 py-2 text-sm hover:bg-stone-50 cursor-pointer"
                  onClick={() => { setPartner2(m.id); setOpen2(false) }}
                >
                  {m.first_name} {m.last_name}
                </div>
              ))}
              {filteredMembers2?.length === 0 && (
                <div className="px-3 py-4 text-sm text-center text-stone-500">Aucun résultat</div>
              )}
            </div>
          </div>
        )}
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
