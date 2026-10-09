import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { MemberPhotoCarousel } from "./MemberPhotoCarousel"

export interface Member {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  deathDate?: string
  gender: string
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

  // Age calculation placeholder
  const age = 42

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-parchemin-50 border-l-border sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif text-3xl text-primary">{member.firstName} {member.lastName}</SheetTitle>
          <SheetDescription className="text-stone-800 font-sans">
            Né(e) le {member.birthDate} - {age} ans
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8">
          <MemberPhotoCarousel personId={member.id} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
