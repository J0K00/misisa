import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardNavbar } from "../components/layout/DashboardNavbar"
import { useAuthStore } from "../store/useAuthStore"
import { useModalStore } from "../store/useModalStore"
import { api } from "../services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, LogOut, Trash2 } from "lucide-react"

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const { showModal } = useModalStore()
  const navigate = useNavigate()
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [password, setPassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleDeleteAccount = async () => {
    if (!password) {
      setError("Veuillez entrer votre mot de passe.")
      return
    }

    setIsDeleting(true)
    setError("")

    try {
      await api.delete("/auth/me", {
        data: { password }
      })
      logout()
      showModal('success', 'Au revoir', 'Votre compte a été supprimé avec succès.')
      navigate("/")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de la suppression du compte.")
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <DashboardNavbar />
      <div className="container max-w-3xl mx-auto p-6 md:p-12 space-y-8">
        <div>
          <h1 className="text-4xl font-serif text-[#2A2421]">Mon Profil</h1>
          <p className="text-stone-500 mt-2">Gérez vos informations et préférences.</p>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-stone-900">Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-stone-500">Prénom</Label>
                <p className="text-lg font-medium text-stone-900">{user?.first_name}</p>
              </div>
              <div>
                <Label className="text-stone-500">Nom</Label>
                <p className="text-lg font-medium text-stone-900">{user?.last_name}</p>
              </div>
            </div>
            <div>
              <Label className="text-stone-500">Email</Label>
              <p className="text-lg font-medium text-stone-900">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-stone-900">Actions du compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Button onClick={handleLogout} variant="outline" className="w-full sm:w-auto text-stone-700">
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </Button>
            </div>

            <div className="pt-6 border-t border-stone-200">
              <h3 className="text-lg font-medium text-red-600 mb-2">Zone de Danger</h3>
              <p className="text-sm text-stone-500 mb-4">
                La suppression de votre compte désactivera votre accès de manière permanente (Soft Delete). 
                Toutes vos familles dont vous êtes l'unique Patriarche pourraient devenir orphelines.
              </p>

              {!showDeleteConfirm ? (
                <Button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  variant="destructive" 
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer mon compte
                </Button>
              ) : (
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 space-y-4 max-w-md">
                  <p className="text-sm text-red-800 font-medium">
                    Cette action est irréversible. Confirmez avec votre mot de passe.
                  </p>
                  
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  
                  <Input 
                    type="password" 
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleDeleteAccount} 
                      disabled={isDeleting}
                      variant="destructive"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Confirmer la suppression
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setPassword("")
                        setError("")
                      }} 
                      variant="ghost"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
