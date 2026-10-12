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
      return res.data as Array<{ id: string, name: string, role: string, view_code?: string, edit_code?: string }>
    }
  })

  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopy = (e: React.MouseEvent, code: string) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

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
      <div className="container max-w-5xl mx-auto p-4 sm:p-6 md:p-12 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#2A2421]">Mes Familles</h1>
            <p className="text-sm text-stone-500 mt-1">Gérez vos arbres généalogiques et partagez vos codes d'accès.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#3B2314] hover:bg-[#2A2421] text-white w-full sm:w-auto">
            <Plus className="w-5 h-5 mr-2" />
            Ajouter une famille
          </Button>
        </div>

        <div className="flex gap-2">
          <Input 
            placeholder="Rechercher une famille..." 
            className="w-full sm:max-w-md bg-white border-stone-200"
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
                  <Card className="hover:border-[#3B2314] transition-all cursor-pointer bg-white h-full shadow-sm hover:shadow-md flex flex-col justify-between">
                    <div>
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
                        <p className="text-xs text-stone-400 font-sans mt-0.5">Cliquez pour ouvrir l'arbre</p>
                      </CardHeader>

                      {/* Section des codes de partage */}
                      {family.role === "PATRIARCH" && (family.view_code || family.edit_code) && (
                        <div className="px-6 pb-4 pt-1 space-y-2 border-t border-stone-100 mt-2" onClick={e => e.preventDefault()}>
                          {family.view_code && (
                            <div className="flex items-center justify-between text-xs bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                              <div className="truncate mr-2">
                                <span className="font-semibold text-stone-700 block">Code Lecture :</span>
                                <code className="font-mono text-stone-600 text-[11px] select-all tracking-wider">{family.view_code}</code>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-stone-600 hover:text-stone-900 border-stone-300"
                                onClick={(e) => handleCopy(e, family.view_code!)}
                              >
                                {copiedCode === family.view_code ? "Copié !" : "Copier"}
                              </Button>
                            </div>
                          )}

                          {family.edit_code && (
                            <div className="flex items-center justify-between text-xs bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                              <div className="truncate mr-2">
                                <span className="font-semibold text-amber-900 block">Code Édition :</span>
                                <code className="font-mono text-amber-800 text-[11px] select-all tracking-wider">{family.edit_code}</code>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-amber-900 hover:text-amber-950 border-amber-300 bg-white"
                                onClick={(e) => handleCopy(e, family.edit_code!)}
                              >
                                {copiedCode === family.edit_code ? "Copié !" : "Copier"}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <CardContent className="pt-2 pb-4 text-xs text-stone-400">
                      Rôle : {family.role === "PATRIARCH" ? "Patriarche" : family.role}
                    </CardContent>
                  </Card>
                </Link>

                {editingId !== family.id && family.role === "PATRIARCH" && (
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/80 hover:bg-white shadow-xs" onClick={(e) => startEdit(e, family.id, family.name)}>
                      <Edit2 className="w-4 h-4 text-stone-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/80 hover:bg-red-50 shadow-xs" onClick={(e) => handleDelete(e, family.id)}>
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
