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

  const [search1, setSearch1] = useState("")
  const [search2, setSearch2] = useState("")
  const [open1, setOpen1] = useState(false)
  const [open2, setOpen2] = useState(false)

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

  const filteredMembers1 = members?.filter((m: any) => 
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(search1.toLowerCase())
  )
  const filteredMembers2 = members?.filter((m: any) => 
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(search2.toLowerCase())
  )

  const getMemberName = (id: string) => {
    const m = members?.find((m: any) => m.id === id)
    return m ? `${m.first_name} ${m.last_name}` : "Sélectionner un membre..."
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
