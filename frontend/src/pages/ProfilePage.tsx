import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardNavbar } from "../components/layout/DashboardNavbar"
import { useAuthStore } from "../store/useAuthStore"
import { useModalStore } from "../store/useModalStore"
import { api } from "../services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogOut, Trash2 } from "lucide-react"

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore()
  const { showModal } = useModalStore()
  const navigate = useNavigate()
  
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [firstName, setFirstName] = useState(user?.first_name || "")
  const [lastName, setLastName] = useState(user?.last_name || "")
  const [birthDate, setBirthDate] = useState(user?.birth_date ? String(user.birth_date).slice(0, 10) : "")
  const [gender, setGender] = useState(user?.gender || "M")
  const [isSaving, setIsSaving] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [password, setPassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  const calculateAge = (bdate?: string) => {
    if (!bdate) return null
    const birthYear = new Date(bdate).getFullYear()
    const currentYear = new Date().getFullYear()
    return currentYear - birthYear
  }

  const currentAge = calculateAge(birthDate || user?.birth_date)

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")

    try {
      const response = await api.put("/auth/me", {
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate || null,
        gender: gender || "M"
      })

      updateUser(response.data)
      setIsEditingInfo(false)
      showModal("success", "Profil mis à jour", "Vos informations et votre âge ont été enregistrés avec succès.")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de la mise à jour.")
    } finally {
      setIsSaving(false)
    }
  }

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
      <div className="container max-w-3xl mx-auto p-4 sm:p-6 md:p-12 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#2A2421]">Mon Profil (Patriarche)</h1>
            <p className="text-stone-500 mt-1">Gérez vos informations personnelles et votre date de naissance.</p>
          </div>
          {!isEditingInfo && (
            <Button 
              variant="outline" 
              onClick={() => {
                setFirstName(user?.first_name || "")
                setLastName(user?.last_name || "")
                setBirthDate(user?.birth_date ? String(user.birth_date).slice(0, 10) : "")
                setIsEditingInfo(true)
              }}
              className="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl"
            >
              Modifier mes informations
            </Button>
          )}
        </div>

        <Card className="bg-white shadow-sm border-stone-200">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-stone-900">Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingInfo ? (
              <form onSubmit={handleSaveInfo} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input 
                      id="firstName"
                      required
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input 
                      id="lastName"
                      required
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="gender">Genre</Label>
                    <select
                      id="gender"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                    >
                      <option value="M">Homme</option>
                      <option value="F">Femme</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="birthDate">Date de naissance</Label>
                    <Input 
                      id="birthDate"
                      type="date"
                      value={birthDate} 
                      onChange={e => setBirthDate(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end pb-2 sm:col-span-1">
                    <span className="text-xs text-stone-500">Âge estimé :</span>
                    <span className="font-semibold text-[#3B2314] text-lg">
                      {currentAge !== null ? `${currentAge} ans` : "Non renseigné"}
                    </span>
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                  <Button type="button" variant="ghost" onClick={() => setIsEditingInfo(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSaving} className="bg-[#3B2314] hover:bg-[#2A2421] text-white">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Enregistrer les modifications
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-stone-500 text-xs">Prénom</Label>
                    <p className="text-lg font-medium text-stone-900">{user?.first_name}</p>
                  </div>
                  <div>
                    <Label className="text-stone-500 text-xs">Nom</Label>
                    <p className="text-lg font-medium text-stone-900">{user?.last_name}</p>
                  </div>
                  <div>
                    <Label className="text-stone-500 text-xs">Genre</Label>
                    <p className="text-lg font-medium text-stone-900">{user?.gender === "F" ? "Femme" : "Homme"}</p>
                  </div>
                  <div>
                    <Label className="text-stone-500 text-xs">Âge</Label>
                    <p className="text-lg font-bold text-[#3B2314]">
                      {currentAge !== null ? `${currentAge} ans` : "Non défini"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                  <div>
                    <Label className="text-stone-500 text-xs">Email</Label>
                    <p className="text-base text-stone-800">{user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-stone-500 text-xs">Date de naissance</Label>
                    <p className="text-base text-stone-800">{user?.birth_date || "Non renseignée"}</p>
                  </div>
                </div>
              </div>
            )}
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
