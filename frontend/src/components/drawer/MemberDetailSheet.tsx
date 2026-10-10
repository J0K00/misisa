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
      <SheetContent className="bg-[#FDFBF7] border-l-stone-200 sm:max-w-md w-full overflow-y-auto">
        <SheetHeader className="mb-4 px-6 pt-6">
          <SheetTitle className="font-serif text-4xl text-[#3B2314] tracking-tight mb-2">
            {member.first_name} {member.last_name}
          </SheetTitle>
          <div className="flex flex-col gap-2 mt-4 text-stone-600 font-sans">
            {member.birth_date && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B2314]/40" />
                <span className="font-medium text-stone-700">Né(e) le {member.birth_date}</span>
              </div>
            )}
            {member.death_date && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                <span className="font-medium text-stone-500">Décédé(e) le {member.death_date}</span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center justify-center bg-[#3B2314]/10 text-[#3B2314] px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                {calculateAge()} ans
              </span>
            </div>
          </div>
        </SheetHeader>
        
        {member.bio && (
          <div className="mt-8 px-6 space-y-4">
            <h3 className="font-serif text-2xl text-stone-900 border-b border-stone-200 pb-2">Biographie</h3>
            <p className="text-stone-700 whitespace-pre-wrap leading-relaxed bg-white/70 p-6 rounded-2xl shadow-sm border border-stone-200/50 text-base">
              {member.bio}
            </p>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-stone-200/50 px-6 pb-8">
          <MemberPhotoCarousel personId={member.id} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
