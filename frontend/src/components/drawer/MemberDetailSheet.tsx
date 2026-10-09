import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { MemberPhotoCarousel } from "./MemberPhotoCarousel"

export interface Member {
  id: string
  first_name: string
  last_name: string
  birth_date: string
  death_date?: string
  gender: string
  bio?: string
  x?: number
  y?: number
}

interface Props {
  member: Member | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MemberDetailSheet({ member, open, onOpenChange }: Props) {
  if (!member) return null

  const calculateAge = () => {
    if (!member.birth_date) return "?"
    const birthYear = new Date(member.birth_date).getFullYear()
    const endYear = member.death_date ? new Date(member.death_date).getFullYear() : new Date().getFullYear()
    return endYear - birthYear
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-[#FDFBF7] border-l-stone-200 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif text-3xl text-[#3B2314]">
            {member.first_name} {member.last_name}
          </SheetTitle>
          <SheetDescription className="text-stone-600 font-sans mt-2 space-y-1">
            <p>Né(e) le {member.birth_date} {member.death_date && `- Décès le ${member.death_date}`}</p>
            <p>{calculateAge()} ans</p>
          </SheetDescription>
        </SheetHeader>
        
        {member.bio && (
          <div className="mt-8 space-y-3">
            <h3 className="font-serif text-xl text-stone-900">Biographie</h3>
            <p className="text-stone-700 whitespace-pre-wrap leading-relaxed bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
              {member.bio}
            </p>
          </div>
        )}

        <div className="mt-10">
          <MemberPhotoCarousel personId={member.id} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
