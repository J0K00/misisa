import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2A2421] overflow-x-hidden font-sans">
      {/* Navbar */}
      <header className="max-w-6xl mx-auto px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-serif text-3xl text-[#3B2314] font-bold tracking-wider">
            MIsisa
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="text-[#3B2314] hover:bg-[#F4EFE6] font-semibold hidden md:flex">
            <Link to="/join">J'ai un code d'accès</Link>
          </Button>
          <Button asChild className="bg-[#3B2314] hover:bg-[#2A2421] text-[#FDFBF7] rounded-full px-6 h-11 text-sm font-semibold">
            <Link to="/login">Se connecter</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto mt-2 px-6 lg:px-8 pt-8 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        {/* Left Content */}
        <div className="space-y-8 z-10 -mt-4 lg:mt-0 lg:-translate-y-8">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-[4.5rem] leading-tight font-bold text-[#2A2421]">
            Vos racines,<br/>Votre héritage.
          </h1>
          <p className="text-stone-600 text-lg md:text-xl max-w-md leading-relaxed font-sans">
            MIsisa est un canevas interactif pour explorer, préserver et partager l'histoire de votre famille à travers les générations.
          </p>
          <div className="flex gap-4 pt-4">
            <Button asChild className="bg-[#3B2314] hover:bg-[#2A2421] text-[#FDFBF7] rounded-full px-8 h-12 text-base shadow-lg">
              <Link to="/register">Commencer</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-8 h-12 text-base border-[#3B2314] text-[#3B2314] hover:bg-[#F4EFE6] bg-transparent">
              <Link to="/join">Rejoindre un arbre</Link>
            </Button>
          </div>
        </div>

        {/* Right Content - Compact Oval Images Cluster */}
        <div className="hidden lg:grid grid-cols-3 gap-6 items-center w-full max-w-lg mx-auto transform -translate-y-4">
          {/* Col 1: Single image, vertically centered */}
          <div className="flex flex-col translate-y-8">
            <div className="w-full aspect-[2/3] bg-[#F4EFE6] rounded-[100px] overflow-hidden shadow-2xl border-4 border-[#FDFBF7]">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80" className="w-full h-full object-cover grayscale sepia-[0.3]" alt="Portrait" />
            </div>
          </div>
          
          {/* Col 2: Two stacked images */}
          <div className="flex flex-col gap-6 -translate-y-8">
            <div className="w-full aspect-[2/3.5] bg-[#F4EFE6] rounded-[100px] overflow-hidden shadow-2xl border-4 border-[#FDFBF7]">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80" className="w-full h-full object-cover grayscale sepia-[0.3]" alt="Portrait" />
            </div>
            <div className="w-full aspect-[2/3.2] bg-[#F4EFE6] rounded-[100px] overflow-hidden shadow-2xl border-4 border-[#FDFBF7]">
              <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80" className="w-full h-full object-cover grayscale sepia-[0.3]" alt="Portrait" />
            </div>
          </div>

          {/* Col 3: Two stacked images, slightly offset */}
          <div className="flex flex-col gap-6 translate-y-4">
            <div className="w-full aspect-[2/3.5] bg-[#F4EFE6] rounded-[100px] overflow-hidden shadow-2xl border-4 border-[#FDFBF7]">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" className="w-full h-full object-cover grayscale sepia-[0.3]" alt="Portrait" />
            </div>
            <div className="w-full aspect-[2/3.2] bg-[#F4EFE6] rounded-[100px] overflow-hidden shadow-2xl border-4 border-[#FDFBF7]">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80" className="w-full h-full object-cover grayscale sepia-[0.3]" alt="Portrait" />
            </div>
          </div>
        </div>
      </main>

      {/* Explanation Section */}
      <section className="bg-[#F4EFE6] py-24 border-t border-[#3B2314]/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center space-y-8">
          <h2 className="font-serif text-4xl font-bold text-[#3B2314]">Comment ça marche ?</h2>
          <p className="text-lg text-stone-700 leading-relaxed">
            MIsisa a été conçu pour recréer l'expérience organique et intemporelle des arbres généalogiques classiques, couplée à la puissance de l'interactivité moderne.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#2A2421]">1. Créez votre famille</h3>
              <p className="text-sm text-stone-600">Devenez le Patriarche de votre arbre. Ajoutez les membres fondateurs et définissez la structure globale de votre famille.</p>
            </div>
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#2A2421]">2. Organisez l'espace</h3>
              <p className="text-sm text-stone-600">Déplacez-vous librement sur un canevas infini. Reliez les membres entre eux par des branches organiques et vivantes.</p>
            </div>
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#2A2421]">3. Invitez et partagez</h3>
              <p className="text-sm text-stone-600">Générez un code d'accès unique pour vos proches. Ils pourront rejoindre l'arbre en tant que simple observateur ou éditeur.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
