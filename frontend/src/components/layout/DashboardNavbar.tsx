import { Link } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { UserCircle } from "lucide-react"

export function DashboardNavbar() {
  const { user } = useAuthStore()

  return (
    <nav className="w-full bg-[#FDFBF7] border-b border-stone-200">
      <div className="container max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="font-serif text-2xl text-[#3B2314] font-bold">
          MIsisa
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-600 hidden md:inline-block">
            Connecté en tant que {user?.first_name} {user?.last_name}
          </span>
          <Button variant="ghost" asChild className="rounded-full px-4 text-[#3B2314] hover:bg-stone-100">
            <Link to="/profile">
              <UserCircle className="w-5 h-5 mr-2" />
              Profil
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
