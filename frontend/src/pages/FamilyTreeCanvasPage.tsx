import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import SpatialCanvas from "@/components/canvas/SpatialCanvas"
import { useFamilyTree } from "@/hooks/useFamilyTree"
import { Plus, Users, ArrowLeft, X } from "lucide-react"
import { CreateMemberForm } from "@/components/forms/CreateMemberForm"
import { CreateUnionForm } from "@/components/forms/CreateUnionForm"
import { useTreeStore } from "@/store/useTreeStore"

import { useAuthStore } from "@/store/useAuthStore"

export default function FamilyTreeCanvasPage() {
  const { familyId } = useParams()
  const { data: treeData, isLoading } = useFamilyTree(familyId || "")
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddUnion, setShowAddUnion] = useState(false)
  const { scale, setZoom } = useTreeStore()
  const { user } = useAuthStore()

  const currentRole = treeData?.current_role || user?.role || "VIEWER"
  const canEdit = currentRole === "PATRIARCH" || currentRole === "EDITOR"

  const roleLabel = currentRole === "PATRIARCH" ? "Patriarche" : currentRole === "EDITOR" ? "Éditeur" : "Lecteur (Lecture seule)"

  return (
    <div className="relative w-full h-screen bg-[#FDFBF7] overflow-hidden">
      {/* Header flottant responsive */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 z-20 p-3 sm:p-4 sm:px-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-stone-200">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#2A2421]">
            {isLoading ? "Chargement..." : treeData?.family?.name || `Arbre`}
          </h2>
          {treeData?.family && (
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 uppercase tracking-wider font-semibold">
              Rôle : <span className={canEdit ? "text-[#3B2314] font-bold" : "text-stone-600"}>{roleLabel}</span>
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          {canEdit && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="border-stone-300 text-stone-700 bg-white hover:bg-stone-50 rounded-full px-4 text-xs sm:text-sm"
                onClick={() => setShowAddUnion(true)}
              >
                Créer une union
              </Button>
              <Button 
                size="sm"
                className="bg-[#3B2314] hover:bg-[#2A2421] text-white rounded-full px-4 text-xs sm:text-sm"
                onClick={() => setShowAddMember(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1 sm:mr-2" />
                Ajouter un membre
              </Button>
            </>
          )}
          
          <Button variant="outline" size="sm" asChild className="rounded-full border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-xs sm:text-sm">
            <Link to={`/family/${familyId}/members`}>
              <Users className="w-3.5 h-3.5 mr-1 sm:mr-2" />
              Liste
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild className="rounded-full text-stone-600 hover:bg-stone-100 text-xs sm:text-sm">
            <Link to={user?.is_guest ? "/login" : "/dashboard"}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1 sm:mr-2" />
              {user?.is_guest ? "Quitter" : "Retour"}
            </Link>
          </Button>
        </div>
      </div>

      <SpatialCanvas />

      {/* Floating Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
        <Button 
          variant="secondary" 
          size="icon" 
          className="bg-white shadow-md rounded-full text-stone-700 hover:bg-stone-50"
          onClick={() => setZoom(Math.min(scale + 0.2, 3))}
        >
          <Plus className="w-5 h-5" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="bg-white shadow-md rounded-full text-stone-700 hover:bg-stone-50"
          onClick={() => setZoom(Math.max(scale - 0.2, 0.1))}
        >
          <span className="text-xl font-bold leading-none mb-1">-</span>
        </Button>
      </div>

      {/* Modal Ajout Membre */}
      {showAddMember && familyId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h2 className="text-xl font-serif font-semibold text-stone-900">Nouveau membre</h2>
              <button onClick={() => setShowAddMember(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <CreateMemberForm 
                familyId={familyId} 
                onClose={() => setShowAddMember(false)} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout Union */}
      {showAddUnion && familyId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h2 className="text-xl font-serif font-semibold text-stone-900">Créer une union</h2>
              <button onClick={() => setShowAddUnion(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <CreateUnionForm 
                familyId={familyId} 
                onClose={() => setShowAddUnion(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
