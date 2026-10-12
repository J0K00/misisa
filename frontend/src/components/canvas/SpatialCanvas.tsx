import React, { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { useTreeStore } from "../../store/useTreeStore"
import { MemberDetailSheet, type Member } from "../drawer/MemberDetailSheet"
import { AddChildToUnionForm } from "../forms/AddChildToUnionForm"
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
  const [selectedUnionId, setSelectedUnionId] = useState<string | null>(null)
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null)

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
        const p1 = members.find((m: any) => m.id === union.partner_1_id)
        const p2 = members.find((m: any) => m.id === union.partner_2_id)
        
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
        const unionChildren = children.filter((c: any) => c.union_id === union.id)
        unionChildren.forEach((c: any) => {
          const child = members.find((m: any) => m.id === c.child_id)
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
    setActiveBranchId(null)
    
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
        {treeData?.unions?.map((union: any) => {
          const p1 = treeData.persons.find((m: any) => m.id === union.partner_1_id)
          const p2 = treeData.persons.find((m: any) => m.id === union.partner_2_id)
          if (!p1 || !p2) return null
          
          const unionMidX = (p1.x! + 200 + p2.x!) / 2
          const unionMidY = p1.y! + 45
          
          const canEdit = treeData?.current_role !== "VIEWER"
          if (!canEdit) return null

          return (
            <div
              key={`union-branch-${union.id}`}
              className="absolute pointer-events-auto flex items-center justify-center z-10 cursor-pointer group"
              style={{ 
                left: unionMidX - 50, 
                top: unionMidY - 20, 
                width: 100, 
                height: 40 
              }}
              onPointerDown={(e) => {
                e.stopPropagation()
                setActiveBranchId(activeBranchId === union.id ? null : union.id)
              }}
            >
              {/* Le bouton + apparait uniquement si la branche est cliquée */}
              {activeBranchId === union.id && (
                <button
                  className="bg-[#3B2314] hover:bg-[#2A2421] text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-transform hover:scale-110 animate-in zoom-in-75 duration-200"
                  title="Ajouter une naissance"
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    setSelectedUnionId(union.id)
                  }}
                >
                  +
                </button>
              )}
            </div>
          )
        })}
      </div>

      <MemberDetailSheet 
        member={selectedMember} 
        open={!!selectedMember} 
        onOpenChange={(o) => !o && setSelectedMember(null)} 
      />

      {/* Modal Ajout Naissance */}
      {selectedUnionId && familyId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h2 className="text-xl font-serif font-semibold text-stone-900">Ajouter une naissance</h2>
              <button onClick={() => setSelectedUnionId(null)} className="text-stone-400 hover:text-stone-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-6">
              <AddChildToUnionForm 
                familyId={familyId} 
                unionId={selectedUnionId}
                onClose={() => setSelectedUnionId(null)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
