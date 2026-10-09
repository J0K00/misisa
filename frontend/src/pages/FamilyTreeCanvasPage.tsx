import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import SpatialCanvas from "@/components/canvas/SpatialCanvas"
import { useFamilyTree } from "@/hooks/useFamilyTree"
import { Plus, Users, ArrowLeft } from "lucide-react"

export default function FamilyTreeCanvasPage() {
  const { familyId } = useParams()
  const { data: treeData, isLoading } = useFamilyTree(familyId || "")

  return (
    <div className="relative w-full h-screen bg-[#FDFBF7] overflow-hidden">
      {/* Header flottant */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 p-4 px-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-stone-200">
        <div>
          <h2 className="text-3xl font-serif text-[#2A2421]">
            {isLoading ? "Chargement..." : treeData?.family?.name || `Arbre`}
          </h2>
          {treeData?.family && (
            <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest font-semibold">
              Rôle : Patriarche
            </p>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button className="bg-[#3B2314] hover:bg-[#2A2421] text-white rounded-full px-6">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un membre
          </Button>
          <Button variant="outline" asChild className="rounded-full border-stone-300 text-stone-700 bg-white hover:bg-stone-50">
            <Link to={`/family/${familyId}/members`}>
              <Users className="w-4 h-4 mr-2" />
              Vue Liste
            </Link>
          </Button>
          <Button variant="ghost" asChild className="rounded-full text-stone-600 hover:bg-stone-100">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Link>
          </Button>
        </div>
      </div>

      <SpatialCanvas />
    </div>
  )
}
