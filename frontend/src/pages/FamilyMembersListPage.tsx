import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function FamilyMembersListPage() {
  const { familyId } = useParams()

  return (
    <div className="container mx-auto p-8 py-12 space-y-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <h1 className="text-4xl font-serif text-primary capitalize">Membres - Famille {familyId}</h1>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link to={`/family/${familyId}`}>Voir l'arbre</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/dashboard">Retour</Link>
          </Button>
        </div>
      </div>

      {/* Placeholder Table (Phase 1) */}
      <div className="border border-border rounded-md bg-card p-12 text-center text-muted-foreground shadow-sm">
        Tableau interactif des membres à venir...
      </div>
    </div>
  )
}
