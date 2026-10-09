import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "../store/useAuthStore"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { api } from "../services/api"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-stone-100">
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-3xl text-[#3B2314] font-bold">MIsisa</Link>
          <h1 className="text-2xl font-serif text-[#2A2421] mt-4">Bon retour</h1>
          <p className="text-stone-500 mt-2">Connectez-vous à votre compte</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
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
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Mot de passe</Label>
              <Link to="#" className="text-sm text-[#3B2314] hover:underline">Mot de passe oublié ?</Link>
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

          <Button type="submit" disabled={isLoading} className="w-full bg-[#3B2314] hover:bg-[#2A2421] text-[#FDFBF7] h-12 text-lg">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Se connecter"}
          </Button>
        </form>

        <p className="text-center mt-6 text-stone-500">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-[#3B2314] hover:underline font-semibold">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
