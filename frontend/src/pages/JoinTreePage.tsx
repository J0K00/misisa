import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function JoinTreePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-stone-100 mt-8 mb-8">
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-3xl text-[#3B2314] font-bold">MIsisa</Link>
          <h1 className="text-2xl font-serif text-[#2A2421] mt-4">Rejoindre un arbre</h1>
          <p className="text-stone-500 mt-2">Saisissez votre code d'accès unique</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code">Code d'invitation</Label>
            <Input id="code" placeholder="Ex: A7K9P2X" className="uppercase text-center text-lg tracking-widest" />
          </div>
          
          <Button type="button" className="w-full bg-[#3B2314] hover:bg-[#2A2421] text-[#FDFBF7] h-12 text-lg mt-4">
            Valider le code
          </Button>
        </form>

        <p className="text-center mt-6 text-stone-500">
          Vous n'avez pas de code ?{" "}
          <Link to="/register" className="text-[#3B2314] hover:underline font-semibold">
            Créer votre propre arbre
          </Link>
        </p>
      </div>
    </div>
  )
}
