import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Loader2, Trash2, Edit2, Check, X } from "lucide-react"
import { CreateFamilyForm } from "../components/forms/CreateFamilyForm"
import { DashboardNavbar } from "../components/layout/DashboardNavbar"
import { useQuery, useMutation } from "@tanstack/react-query"
import { api } from "../services/api"

export default function DashboardPage() {
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const { data: families = [], isLoading, refetch } = useQuery({
    queryKey: ["my-families"],
    queryFn: async () => {
      const res = await api.get("/family/my-families")
      return res.data as Array<{ id: string, name: string, role: string }>
    }
  })

  const updateFamilyMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string, name: string }) => {
      await api.put(`/family/${id}`, { name })
    },
    onSuccess: () => {
      setEditingId(null)
      refetch()
    }
  })

  const deleteFamilyMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/family/${id}`)
    },
    onSuccess: () => {
      refetch()
    }
  })

  const filteredFamilies = families.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm("Voulez-vous vraiment supprimer cet arbre ? (Soft Delete)")) {
      deleteFamilyMutation.mutate(id)
    }
  }

  const startEdit = (e: React.MouseEvent, id: string, currentName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingId(id)
    setEditName(currentName)
  }

  const cancelEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingId(null)
  }

  const saveEdit = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    updateFamilyMutation.mutate({ id, name: editName })
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <DashboardNavbar />
      <div className="container max-w-5xl mx-auto p-6 md:p-12 space-y-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-stone-200 pb-6">
          <h1 className="text-4xl font-serif text-[#2A2421]">Mes Familles</h1>
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#3B2314] hover:bg-[#2A2421] text-white">
            <Plus className="w-5 h-5 mr-2" />
            Ajouter une famille
          </Button>
        </div>

        <div className="flex gap-2">
          <Input 
            placeholder="Rechercher une famille..." 
            className="max-w-md bg-white border-stone-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="secondary" className="bg-stone-200 text-stone-700 hover:bg-stone-300">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {showForm && (
          <Card className="bg-white border-dashed border-2 mb-8 border-stone-300">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-stone-900">Nouvelle Famille</CardTitle>
              <CardDescription>Créer un nouvel arbre généalogique</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateFamilyForm onSuccess={() => {
                setShowForm(false)
                refetch()
              }} />
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFamilies.map((family) => (
              <div key={family.id} className="relative group">
                <Link to={`/family/${family.id}`}>
                  <Card className="hover:border-[#3B2314] transition-colors cursor-pointer bg-white h-full shadow-sm hover:shadow-md">
                    <CardHeader className="pb-3">
                      {editingId === family.id ? (
                        <div className="flex items-center gap-2" onClick={e => e.preventDefault()}>
                          <Input 
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            autoFocus
                          />
                          <Button size="icon" variant="ghost" onClick={e => saveEdit(e, family.id)}>
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={cancelEdit}>
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <CardTitle className="font-serif text-2xl text-stone-900 pr-12">{family.name}</CardTitle>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-stone-500">Ouvrir le canvas interactif</p>
                    </CardContent>
                  </Card>
                </Link>

                {editingId !== family.id && family.role === "PATRIARCH" && (
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/80 hover:bg-white" onClick={(e) => startEdit(e, family.id, family.name)}>
                      <Edit2 className="w-4 h-4 text-stone-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/80 hover:bg-red-50" onClick={(e) => handleDelete(e, family.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {filteredFamilies.length === 0 && !isLoading && (
              <p className="text-stone-500 italic col-span-full">Aucune famille trouvée.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
