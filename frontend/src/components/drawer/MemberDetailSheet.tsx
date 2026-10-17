import { useState } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { MemberPhotoCarousel } from "./MemberPhotoCarousel"
import { EditMemberForm } from "../forms/EditMemberForm"
import { Button } from "@/components/ui/button"
import { Edit2, Calendar, User as UserIcon, HeartHandshake } from "lucide-react"

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
  currentRole?: string
  familyId?: string
}

export function MemberDetailSheet({ member, open, onOpenChange, currentRole = "VIEWER", familyId = "" }: Props) {
  const [isEditing, setIsEditing] = useState(false)

  if (!member) return null

  const isPatriarch = currentRole === "PATRIARCH"

  const calculateAge = () => {
    if (!member.birth_date) return null
    const birthYear = new Date(member.birth_date).getFullYear()
    const endYear = member.death_date ? new Date(member.death_date).getFullYear() : new Date().getFullYear()
    return endYear - birthYear
  }

  const age = calculateAge()
  const initials = `${member.first_name?.[0] || ""}${member.last_name?.[0] || ""}`.toUpperCase()

  return (
    <Sheet open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) setIsEditing(false) }}>
      <SheetContent className="bg-[#FDFBF7] border-l-stone-200 sm:max-w-md w-full p-0 overflow-y-auto">
        {/* 1. Carousel d'images en tête de page (Hero Header) */}
        <div className="bg-stone-200/50 pt-3 pb-2 border-b border-stone-200">
          <MemberPhotoCarousel 
            personId={member.id} 
            canUploadPhotos={isPatriarch} 
            showHeader={false}
          />
        </div>

        {/* 2. Profil Utilisateur : Avatar et Identité */}
        <div className="px-6 pt-4 pb-8 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#3B2314] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md ring-4 ring-white">
                {initials}
              </div>
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A2421] tracking-tight">
                  {member.first_name} {member.last_name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                    <UserIcon className="w-3 h-3 text-stone-500" />
                    {member.gender === "M" ? "Homme" : member.gender === "F" ? "Femme" : "Autre"}
                  </span>
                  {age !== null && (
                    <span className="inline-flex items-center bg-[#3B2314]/10 text-[#3B2314] text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {age} ans
                    </span>
                  )}
                  {member.death_date && (
                    <span className="inline-flex items-center bg-stone-200 text-stone-600 text-xs px-2.5 py-0.5 rounded-full">
                      Décédé(e)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bouton de modification réservé au Patriarche */}
            {isPatriarch && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-xl border-stone-300 text-stone-700 hover:bg-stone-100 text-xs gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {isEditing ? "Fermer" : "Modifier"}
              </Button>
            )}
          </div>

          {/* Formulaire d'édition si ouvert par le Patriarche */}
          {isEditing ? (
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in duration-200">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">
                Modifier le profil du membre
              </h3>
              <EditMemberForm 
                member={member} 
                familyId={familyId} 
                onClose={() => setIsEditing(false)} 
              />
            </div>
          ) : (
            <>
              {/* Informations temporelles */}
              <div className="bg-white/80 p-4 rounded-2xl border border-stone-200/60 shadow-xs space-y-2 text-sm text-stone-600">
                {member.birth_date && (
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-[#3B2314]/60 shrink-0" />
                    <span>Né(e) le <strong className="text-stone-800">{member.birth_date}</strong></span>
                  </div>
                )}
                {member.death_date && (
                  <div className="flex items-center gap-2.5 pt-1 border-t border-stone-100">
                    <HeartHandshake className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>Décédé(e) le <strong className="text-stone-700">{member.death_date}</strong></span>
                  </div>
                )}
              </div>

              {/* Biographie */}
              <div className="space-y-2.5">
                <h3 className="font-serif text-xl font-bold text-[#2A2421] border-b border-stone-200 pb-1.5">
                  Biographie
                </h3>
                {member.bio ? (
                  <p className="text-stone-700 whitespace-pre-wrap leading-relaxed bg-white/70 p-5 rounded-2xl shadow-xs border border-stone-200/50 text-sm">
                    {member.bio}
                  </p>
                ) : (
                  <p className="text-stone-400 italic text-xs bg-stone-50 p-4 rounded-xl border border-stone-100">
                    Aucune biographie renseignée pour ce membre.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
