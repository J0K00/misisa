import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "../store/useAuthStore"
import { api } from "../services/api"
import { Loader2, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await api.post("/auth/register", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password
      })
      
      // En cas de succès, on simule l'authentification immédiate
      setAuth(response.data.user, response.data.access_token)
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de l'inscription.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-stone-100 mt-8 mb-8">
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-3xl text-[#3B2314] font-bold">MIsisa</Link>
          <h1 className="text-2xl font-serif text-[#2A2421] mt-4">Créer un compte</h1>
          <p className="text-stone-500 mt-2">Débutez l'histoire de votre famille</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input 
                id="firstName" 
                placeholder="Jean" 
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input 
                id="lastName" 
                placeholder="Dupont" 
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Adresse Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="jean.dupont@email.com" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
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

          <Button type="submit" disabled={isLoading} className="w-full bg-[#3B2314] hover:bg-[#2A2421] text-[#FDFBF7] h-12 text-lg mt-4">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "S'inscrire"}
          </Button>
        </form>

        <p className="text-center mt-6 text-stone-500">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-[#3B2314] hover:underline font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
