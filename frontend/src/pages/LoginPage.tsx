import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "../store/useAuthStore"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { api } from "../services/api"

export default function LoginPage() {
  const [mode, setMode] = useState<"account" | "guest">("account")
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [guestCode, setGuestCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password
      })
      
      setAuth(response.data.user, response.data.access_token)
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Email ou mot de passe incorrect.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await api.post("/auth/guest-login", {
        code: guestCode
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
      navigate(`/family/${response.data.family_id}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Code d'accès invalide.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-stone-100">
        <div className="text-center mb-6">
          <Link to="/" className="font-serif text-3xl text-[#3B2314] font-bold">MIsisa</Link>
          <h1 className="text-2xl font-serif text-[#2A2421] mt-3">Bienvenue</h1>
          <p className="text-stone-500 text-sm mt-1">Accédez à votre espace ou rejoignez une famille</p>
        </div>

        {/* Tabs de sélection */}
        <div className="flex bg-stone-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setMode("account"); setError("") }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "account" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
          >
            Compte Patriarche
          </button>
          <button
            type="button"
            onClick={() => { setMode("guest"); setError("") }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "guest" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
          >
            Accès par Code (Invité)
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        {mode === "account" ? (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="patriarche@famille.com" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Link to="#" className="text-xs text-[#3B2314] hover:underline">Mot de passe oublié ?</Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required
                  className="pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-[#3B2314] hover:bg-[#2A2421] text-[#FDFBF7] h-11 text-base">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Se connecter"}
            </Button>

            <p className="text-center pt-2 text-sm text-stone-500">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-[#3B2314] hover:underline font-semibold">
                Créer un compte
              </Link>
            </p>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleGuestSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="guestCode">Code d'accès unique</Label>
              <Input 
                id="guestCode" 
                type="text" 
                placeholder="Ex: 8X7K2M9LP4Q1V6TN" 
                value={guestCode}
                onChange={e => setGuestCode(e.target.value.toUpperCase())}
                required
                className="font-mono tracking-widest text-center uppercase"
                maxLength={16}
              />
              <p className="text-xs text-stone-500 pt-1">
                Entrez le code à 16 caractères (Lecture ou Édition) partagé par votre Patriarche. Aucun compte requis.
              </p>
            </div>

            <Button type="submit" disabled={isLoading || guestCode.length < 8} className="w-full bg-[#3B2314] hover:bg-[#2A2421] text-[#FDFBF7] h-11 text-base">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Accéder à l'arbre généalogique"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
