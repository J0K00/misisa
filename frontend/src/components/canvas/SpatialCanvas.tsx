import React, { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { useTreeStore } from "../../store/useTreeStore"
import { MemberDetailSheet, type Member } from "../drawer/MemberDetailSheet"
import { useFamilyTree } from "../../hooks/useFamilyTree"
import { Loader2 } from "lucide-react"

export default function SpatialCanvas() {
  const { familyId } = useParams()
  const { data: treeData, isLoading } = useFamilyTree(familyId || "")

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { x, y, scale, setPan, setZoom } = useTreeStore()
  
  const [isDragging, setIsDragging] = useState(false)
  const [startPan, setStartPan] = useState({ x: 0, y: 0 })
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  // Rendu du Canvas 2D pour les racines (Lignes organiques)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      draw(ctx)
    }
    
    const draw = (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(scale, scale)
      
      // Style des racines
      ctx.strokeStyle = "#5C3A21" // ambre-900 (bois sombre)
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      
      const members = treeData?.persons || []
      const unions = treeData?.unions || []
      const children = treeData?.children || []

      unions.forEach((union: any) => {
        const p1 = members.find((m: any) => m.id === union.partner1Id)
        const p2 = members.find((m: any) => m.id === union.partner2Id)
        
      // 1. Dessiner le lien d'union (horizontal - plus épais)
        if (p1 && p2) {
          ctx.beginPath()
          ctx.lineWidth = 6 // Tronc/Union plus épais
          const startX = p1.x! + 200 // côté droit de la carte 1
          const startY = p1.y! + 45  // milieu de la carte
          const endX = p2.x!         // côté gauche de la carte 2
          const endY = p2.y! + 45
          
          ctx.moveTo(startX, startY)
          
          // Courbe de Bézier pour donner un aspect naturel / liane
          ctx.bezierCurveTo(
            startX + 50, startY + 30, 
            endX - 50, endY - 30, 
            endX, endY
          )
          ctx.stroke()
        }
        
        // 2. Dessiner les liens verticaux (enfants - s'affinant)
        const unionChildren = children.filter((c: any) => c.unionId === union.id)
        unionChildren.forEach((c: any) => {
          const child = members.find((m: any) => m.id === c.childId)
          if (child && p1 && p2) {
            const unionMidX = (p1.x! + 200 + p2.x!) / 2
            const unionMidY = p1.y! + 45

            ctx.beginPath()
            ctx.lineWidth = 3 // S'affine vers les branches enfants
            ctx.moveTo(unionMidX, unionMidY)
            
            // Racine descendant vers l'enfant
            ctx.bezierCurveTo(
              unionMidX, unionMidY + 100,
              child.x! + 100, child.y! - 100,
              child.x! + 100, child.y! // Haut de la carte enfant
            )
            ctx.stroke()
          }
        })
      })

      ctx.restore()
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [x, y, scale])

  const handleMouseDown = (e: React.MouseEvent) => {
    // Si on clique sur un membre, on ne pan pas
    if ((e.target as HTMLElement).closest('.member-node')) return
    
    setIsDragging(true)
    setStartPan({ x: e.clientX - x, y: e.clientY - y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan(e.clientX - startPan.x, e.clientY - startPan.y)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    const zoomSensitivity = 0.001
    const newScale = Math.min(Math.max(0.1, scale - e.deltaY * zoomSensitivity), 3)
    setZoom(newScale)
  }

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      
      {/* Nœuds du DOM HTML par-dessus le Canvas pour l'interactivité */}
      <div 
        className="absolute inset-0 pointer-events-none origin-top-left"
        style={{ transform: `translate(${x}px, ${y}px) scale(${scale})` }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}
        
        {treeData?.persons?.map((member: any) => (
          <div 
            key={member.id}
            className="member-node absolute pointer-events-auto bg-card border-2 border-stone-800/20 hover:border-primary text-card-foreground p-4 rounded-xl shadow-md w-[200px] text-center cursor-pointer transition-colors"
            style={{ left: member.x || 0, top: member.y || 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMember(member);
            }}
          >
            <h3 className="font-serif text-xl font-bold text-stone-900">{member.first_name}</h3>
            <p className="font-serif text-lg text-stone-800">{member.last_name}</p>
          </div>
        ))}
      </div>

      <MemberDetailSheet 
        member={selectedMember} 
        open={!!selectedMember} 
        onOpenChange={(o) => !o && setSelectedMember(null)} 
      />
    </div>
  )
}
