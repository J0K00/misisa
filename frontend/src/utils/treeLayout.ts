export interface PositionedPerson {
  id: string
  first_name: string
  last_name: string
  gender: string
  birth_date?: string
  death_date?: string
  bio?: string
  photos?: any[]
  x: number
  y: number
  [key: string]: any
}

export function computeHierarchicalLayout(
  persons: any[] = [],
  unions: any[] = [],
  children: any[] = []
): { [id: string]: { x: number; y: number } } {
  const CARD_WIDTH = 200
  const COUPLE_GAP = 80
  const SIBLING_GAP = 60
  const SUBTREE_GAP = 120
  const LAYER_GAP = 240
  const START_Y = 60

  if (!persons || persons.length === 0) return {}

  const personMap = new Map<string, any>()
  persons.forEach((p) => personMap.set(String(p.id), p))

  const unionMap = new Map<string, any>()
  unions.forEach((u) => unionMap.set(String(u.id), u))

  const childToParentUnion = new Map<string, string>()
  const unionToChildren = new Map<string, string[]>()
  unions.forEach((u) => unionToChildren.set(String(u.id), []))

  children.forEach((c) => {
    const uid = String(c.union_id)
    const cid = String(c.child_id)
    childToParentUnion.set(cid, uid)
    if (unionToChildren.has(uid)) {
      unionToChildren.get(uid)!.push(cid)
    }
  })

  const personUnions = new Map<string, any[]>()
  persons.forEach((p) => personUnions.set(String(p.id), []))

  unions.forEach((u) => {
    const p1 = String(u.partner_1_id)
    const p2 = String(u.partner_2_id)
    if (personUnions.has(p1)) personUnions.get(p1)!.push(u)
    if (personUnions.has(p2)) personUnions.get(p2)!.push(u)
  })

  // 1. Calcul des niveaux générationnels (0, 1, 2...)
  const levels = new Map<string, number>()
  persons.forEach((p) => levels.set(String(p.id), 0))

  let changed = true
  let iterations = 0
  while (changed && iterations < 50) {
    changed = false
    iterations++

    // Enfant >= parent + 1
    childToParentUnion.forEach((uid, cid) => {
      if (levels.has(cid) && unionMap.has(uid)) {
        const u = unionMap.get(uid)!
        const p1Lvl = levels.get(String(u.partner_1_id)) || 0
        const p2Lvl = levels.get(String(u.partner_2_id)) || 0
        const parentMax = Math.max(p1Lvl, p2Lvl)
        const currentLvl = levels.get(cid) || 0
        if (currentLvl < parentMax + 1) {
          levels.set(cid, parentMax + 1)
          changed = true
        }
      }
    })

    // Conjoints au même niveau
    unions.forEach((u) => {
      const p1 = String(u.partner_1_id)
      const p2 = String(u.partner_2_id)
      if (levels.has(p1) && levels.has(p2)) {
        const maxLvl = Math.max(levels.get(p1)!, levels.get(p2)!)
        if (levels.get(p1)! !== maxLvl) {
          levels.set(p1, maxLvl)
          changed = true
        }
        if (levels.get(p2)! !== maxLvl) {
          levels.set(p2, maxLvl)
          changed = true
        }
      }
    })
  }

  const visitedPersons = new Set<string>()
  const positions: { [id: string]: { x: number; y: number } } = {}

  function getOrderedCouple(u: any, pid: string): [string, string | null] {
    const p1Id = String(u.partner_1_id)
    const p2Id = String(u.partner_2_id)
    const spouseId = p1Id === pid ? p2Id : p1Id
    if (!personMap.has(spouseId)) return [pid, null]

    const pObj = personMap.get(pid)!
    const sObj = personMap.get(spouseId)!
    // Homme à gauche, Femme à droite si possible
    if (pObj.gender === "F" && sObj.gender === "M") {
      return [spouseId, pid]
    }
    return [pid, spouseId]
  }

  function measureNodeWidth(pid: string): number {
    const pU = personUnions.get(pid) || []
    const primaryUnion = pU[0] || null
    let spouseId: string | null = null
    if (primaryUnion) {
      const [leftId, rightId] = getOrderedCouple(primaryUnion, pid)
      spouseId = leftId === pid ? rightId : leftId
    }

    const hasCouple = spouseId !== null
    const coupleWidth = hasCouple ? CARD_WIDTH * 2 + COUPLE_GAP : CARD_WIDTH

    const childrenIds = primaryUnion ? unionToChildren.get(String(primaryUnion.id)) || [] : []
    const validChildren = childrenIds.filter((cid) => personMap.has(cid))
    if (validChildren.length === 0) return coupleWidth

    const totalChildrenWidth =
      validChildren.reduce((sum, cid) => sum + measureNodeWidth(cid), 0) +
      (validChildren.length - 1) * SIBLING_GAP
    return Math.max(coupleWidth, totalChildrenWidth)
  }

  function layoutFamilyNode(personId: string, currentX: number, currentY: number): number {
    visitedPersons.add(personId)
    const pU = personUnions.get(personId) || []
    const primaryUnion = pU[0] || null

    let leftId = personId
    let rightId: string | null = null
    if (primaryUnion) {
      const [l, r] = getOrderedCouple(primaryUnion, personId)
      leftId = l
      rightId = r
      visitedPersons.add(leftId)
      if (rightId) visitedPersons.add(rightId)
    }

    const hasCouple = rightId !== null
    const coupleWidth = hasCouple ? CARD_WIDTH * 2 + COUPLE_GAP : CARD_WIDTH

    const childrenIds = primaryUnion ? unionToChildren.get(String(primaryUnion.id)) || [] : []
    const childNodes = childrenIds.filter((cid) => personMap.has(cid) && !visitedPersons.has(cid))

    if (childNodes.length === 0) {
      positions[leftId] = { x: currentX, y: currentY }
      if (rightId) {
        positions[rightId] = { x: currentX + CARD_WIDTH + COUPLE_GAP, y: currentY }
      }
      return coupleWidth
    }

    const widths = childNodes.map((cid) => measureNodeWidth(cid))
    const totalChildrenWidth =
      widths.reduce((a, b) => a + b, 0) + (widths.length - 1) * SIBLING_GAP
    const branchWidth = Math.max(coupleWidth, totalChildrenWidth)

    // Centrage du couple au-dessus de la branche
    const coupleOffset = Math.floor((branchWidth - coupleWidth) / 2)
    const pLeftX = currentX + coupleOffset
    positions[leftId] = { x: pLeftX, y: currentY }
    if (rightId) {
      positions[rightId] = { x: pLeftX + CARD_WIDTH + COUPLE_GAP, y: currentY }
    }

    // Centrage des enfants sous la branche
    const childrenOffset = Math.floor((branchWidth - totalChildrenWidth) / 2)
    let runningX = currentX + childrenOffset
    const childY = currentY + LAYER_GAP

    childNodes.forEach((cid, idx) => {
      layoutFamilyNode(cid, runningX, childY)
      runningX += widths[idx] + SIBLING_GAP
    })

    return branchWidth
  }

  function isInLaw(pid: string): boolean {
    const pU = personUnions.get(pid) || []
    for (const u of pU) {
      const p1 = String(u.partner_1_id)
      const p2 = String(u.partner_2_id)
      const spouse = p1 === pid ? p2 : p1
      if (childToParentUnion.has(spouse)) {
        return true
      }
    }
    return false
  }

  // Racines
  const roots = Array.from(personMap.keys()).filter(
    (pid) => !childToParentUnion.has(pid) && !isInLaw(pid)
  )
  roots.sort((a, b) => {
    const lvlA = levels.get(a) || 0
    const lvlB = levels.get(b) || 0
    if (lvlA !== lvlB) return lvlA - lvlB
    const hasUA = (personUnions.get(a) || []).length > 0 ? 0 : 1
    const hasUB = (personUnions.get(b) || []).length > 0 ? 0 : 1
    return hasUA - hasUB
  })

  let cursorX = 60
  roots.forEach((rootId) => {
    if (visitedPersons.has(rootId)) return
    const rootY = START_Y + (levels.get(rootId) || 0) * LAYER_GAP
    const w = layoutFamilyNode(rootId, cursorX, rootY)
    cursorX += w + SUBTREE_GAP
  })

  // Membres indépendants / non connectés
  personMap.forEach((_, pid) => {
    if (!visitedPersons.has(pid)) {
      const y = START_Y + (levels.get(pid) || 0) * LAYER_GAP
      positions[pid] = { x: cursorX, y }
      cursorX += CARD_WIDTH + SUBTREE_GAP
    }
  })

  return positions
}
