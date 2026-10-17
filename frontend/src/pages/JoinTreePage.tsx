import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "../store/useAuthStore"
import { api } from "../services/api"
import { Loader2, Eye, Edit3 } from "lucide-react"

export default function JoinTreePage() {
  const [activeTab, setActiveTab] = useState<"viewer" | "editor">("viewer")
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const cleanCode = code.trim().toUpperCase()
    const expectedRole = activeTab === "viewer" ? "VIEWER" : "EDITOR"

    try {
      const response = await api.post("/auth/guest-login", {
        code: cleanCode,
        expected_role: expectedRole
      })

      const guestUser = {
        id: "guest",
        email: "guest@family.local",
        first_name: "Invité",
        last_name: `(${response.data.role.toLowerCase()})`,
        role: response.data.role,
        is_guest: true
      }

      setAuth(guestUser, response.data.access_token)
      if (activeTab === "editor") {
        navigate(`/family/${response.data.family_id}?openAddMember=true`)
      } else {
        navigate(`/family/${response.data.family_id}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Code d'accès invalide pour cet espace.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-stone-100">
        <div className="text-center mb-6">
          <Link to="/" className="font-serif text-3xl text-[#3B2314] font-bold">MIsisa</Link>
          <h1 className="text-2xl font-serif text-[#2A2421] mt-3">Rejoindre une famille</h1>
          <p className="text-stone-500 text-sm mt-1">Accédez à l'arbre généalogique grâce à votre code d'accès</p>
        </div>

        {/* Deux onglets stricts : Lecteur vs Éditeur */}
        <div className="flex bg-stone-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab("viewer"); setError(""); setCode("") }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              activeTab === "viewer" ? "bg-white text-stone-900 shadow-sm font-semibold" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <Eye className="w-4 h-4 text-stone-600" />
            Accès Lecteur (Invité)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("editor"); setError(""); setCode("") }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              activeTab === "editor" ? "bg-white text-stone-900 shadow-sm font-semibold" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <Edit3 className="w-4 h-4 text-amber-800" />
            Rejoindre (Éditeur)
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="code">
              {activeTab === "viewer" ? "Code de Lecture (16 caractères)" : "Code d'Édition (16 caractères)"}
            </Label>
            <Input 
              id="code" 
              type="text"
              placeholder="Ex: 8X7K2M9LP4Q1V6TN" 
              className="uppercase text-center text-lg tracking-widest font-mono" 
              maxLength={16}
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              required
            />
            <p className="text-xs text-stone-500 pt-1">
              {activeTab === "viewer"
                ? "Ce code permet de consulter l'arbre en lecture seule. Un code d'édition sera refusé ici."
                : "Ce code permet d'ajouter des membres et des unions dans l'arbre. Un code de lecture sera refusé ici."}
            </p>
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || code.trim().length < 8} 
            className="w-full bg-[#3B2314] hover:bg-[#2A2421] text-[#FDFBF7] h-12 text-base mt-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              activeTab === "viewer" ? "Consulter en lecture seule" : "Rejoindre et éditer l'arbre"
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col gap-2 text-center text-sm text-stone-500">
          <p>
            Vous êtes le Patriarche ?{" "}
            <Link to="/login" className="text-[#3B2314] hover:underline font-semibold">
              Connexion avec compte
            </Link>
          </p>
          <p>
            Pas encore d'arbre ?{" "}
            <Link to="/register" className="text-[#3B2314] hover:underline font-semibold">
              Créer votre propre famille
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
