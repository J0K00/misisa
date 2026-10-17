from typing import List, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from entity.person_entity import PersonEntity
from entity.union_entity import UnionEntity, UnionChildrenEntity

CARD_WIDTH = 200
CARD_HEIGHT = 90
COUPLE_GAP = 80
SIBLING_GAP = 60
SUBTREE_GAP = 120
LAYER_GAP = 240
START_Y = 60

def compute_hierarchical_layout(
    persons: List[Any], 
    unions: List[Any], 
    children: List[Any]
) -> Dict[str, Dict[str, int]]:
    """
    Computes hierarchical (x, y) coordinates for all persons in a family tree.
    Returns: { person_id: { 'x': int, 'y': int } }
    """
    if not persons:
        return {}

    def get_id(obj):
        if isinstance(obj, dict):
            return str(obj.get("id"))
        return str(getattr(obj, "id"))

    def get_field(obj, field):
        if isinstance(obj, dict):
            return obj.get(field)
        return getattr(obj, field, None)

    person_map = {get_id(p): p for p in persons}
    union_map = {get_id(u): u for u in unions}

    child_to_parent_union = {}
    union_to_children = {get_id(u): [] for u in unions}
    for c in children:
        uid = str(get_field(c, "union_id"))
        cid = str(get_field(c, "child_id"))
        child_to_parent_union[cid] = uid
        if uid in union_to_children:
            union_to_children[uid].append(cid)

    person_unions = {pid: [] for pid in person_map}
    for u in unions:
        p1 = str(get_field(u, "partner_1_id"))
        p2 = str(get_field(u, "partner_2_id"))
        if p1 in person_unions:
            person_unions[p1].append(u)
        if p2 in person_unions:
            person_unions[p2].append(u)

    # 1. Topological level calculation
    levels = {pid: 0 for pid in person_map}
    changed = True
    iterations = 0
    while changed and iterations < 50:
        changed = False
        iterations += 1

        for cid, uid in child_to_parent_union.items():
            if cid in levels and uid in union_map:
                u = union_map[uid]
                p1_lvl = levels.get(str(get_field(u, "partner_1_id")), 0)
                p2_lvl = levels.get(str(get_field(u, "partner_2_id")), 0)
                parent_max = max(p1_lvl, p2_lvl)
                if levels[cid] < parent_max + 1:
                    levels[cid] = parent_max + 1
                    changed = True

        for u in unions:
            p1 = str(get_field(u, "partner_1_id"))
            p2 = str(get_field(u, "partner_2_id"))
            if p1 in levels and p2 in levels:
                max_lvl = max(levels[p1], levels[p2])
                if levels[p1] != max_lvl:
                    levels[p1] = max_lvl
                    changed = True
                if levels[p2] != max_lvl:
                    levels[p2] = max_lvl
                    changed = True

    visited_persons = set()
    positions = {}

    def get_ordered_couple(u, pid: str):
        p1_id = str(get_field(u, "partner_1_id"))
        p2_id = str(get_field(u, "partner_2_id"))
        spouse_id = p2_id if p1_id == pid else p1_id
        if spouse_id not in person_map:
            return pid, None
        
        # Gender ordering: Male on left, Female on right if possible
        p_obj = person_map[pid]
        s_obj = person_map[spouse_id]
        if get_field(p_obj, "gender") == "F" and get_field(s_obj, "gender") == "M":
            return spouse_id, pid
        return pid, spouse_id

    def measure_node_width(pid: str) -> int:
        p_unions = person_unions.get(pid, [])
        primary_union = p_unions[0] if p_unions else None
        spouse_id = None
        if primary_union:
            left_id, right_id = get_ordered_couple(primary_union, pid)
            spouse_id = right_id if left_id == pid else left_id

        has_couple = spouse_id is not None
        couple_width = (CARD_WIDTH * 2 + COUPLE_GAP) if has_couple else CARD_WIDTH

        children_ids = union_to_children.get(get_id(primary_union), []) if primary_union else []
        valid_children = [cid for cid in children_ids if cid in person_map]
        if not valid_children:
            return couple_width

        total_cw = sum(measure_node_width(cid) for cid in valid_children) + (len(valid_children) - 1) * SIBLING_GAP
        return max(couple_width, total_cw)

    def layout_family_node(person_id: str, current_x: int, current_y: int) -> int:
        visited_persons.add(person_id)
        p_unions = person_unions.get(person_id, [])
        primary_union = p_unions[0] if p_unions else None

        left_id, right_id = person_id, None
        if primary_union:
            left_id, right_id = get_ordered_couple(primary_union, person_id)
            visited_persons.add(left_id)
            if right_id:
                visited_persons.add(right_id)

        has_couple = right_id is not None
        couple_width = (CARD_WIDTH * 2 + COUPLE_GAP) if has_couple else CARD_WIDTH

        children_ids = union_to_children.get(get_id(primary_union), []) if primary_union else []
        child_nodes = [cid for cid in children_ids if cid in person_map and cid not in visited_persons]

        if not child_nodes:
            positions[left_id] = {"x": current_x, "y": current_y}
            if has_couple:
                positions[right_id] = {"x": current_x + CARD_WIDTH + COUPLE_GAP, "y": current_y}
            return couple_width

        widths = [measure_node_width(cid) for cid in child_nodes]
        total_children_width = sum(widths) + (len(widths) - 1) * SIBLING_GAP
        branch_width = max(couple_width, total_children_width)

        # Center couple
        couple_offset = (branch_width - couple_width) // 2
        p_left_x = current_x + couple_offset
        positions[left_id] = {"x": p_left_x, "y": current_y}
        if has_couple:
            positions[right_id] = {"x": p_left_x + CARD_WIDTH + COUPLE_GAP, "y": current_y}

        # Center children below
        children_offset = (branch_width - total_children_width) // 2
        running_x = current_x + children_offset
        child_y = current_y + LAYER_GAP

        for i, cid in enumerate(child_nodes):
            layout_family_node(cid, running_x, child_y)
            running_x += widths[i] + SIBLING_GAP

        return branch_width

    def is_in_law(pid: str) -> bool:
        p_u = person_unions.get(pid, [])
        for u in p_u:
            p1 = str(get_field(u, "partner_1_id"))
            p2 = str(get_field(u, "partner_2_id"))
            spouse = p2 if p1 == pid else p1
            if spouse in child_to_parent_union:
                return True
        return False

    roots = [pid for pid in person_map if pid not in child_to_parent_union and not is_in_law(pid)]
    roots.sort(key=lambda pid: (levels[pid], 0 if person_unions.get(pid) else 1))

    cursor_x = 60
    for root_id in roots:
        if root_id in visited_persons:
            continue
        root_y = START_Y + levels[root_id] * LAYER_GAP
        w = layout_family_node(root_id, cursor_x, root_y)
        cursor_x += w + SUBTREE_GAP

    # Disconnected or remaining members
    for pid in person_map:
        if pid not in visited_persons:
            y = START_Y + levels[pid] * LAYER_GAP
            positions[pid] = {"x": cursor_x, "y": y}
            cursor_x += CARD_WIDTH + SUBTREE_GAP

    return positions


def apply_family_layout(db: Session, family_id: UUID):
    """
    Calculates and persists hierarchical coordinates for all members of family_id.
    """
    persons = db.query(PersonEntity).filter(PersonEntity.family_id == family_id).all()
    if not persons:
        return

    person_ids = [p.id for p in persons]
    unions = db.query(UnionEntity).filter(
        (UnionEntity.partner_1_id.in_(person_ids)) | (UnionEntity.partner_2_id.in_(person_ids))
    ).all()
    union_ids = [u.id for u in unions]

    children = db.query(UnionChildrenEntity).filter(
        UnionChildrenEntity.union_id.in_(union_ids)
    ).all()

    layout = compute_hierarchical_layout(persons, unions, children)

    modified = False
    for p in persons:
        coords = layout.get(str(p.id))
        if coords:
            if p.x != coords["x"] or p.y != coords["y"]:
                p.x = coords["x"]
                p.y = coords["y"]
                modified = True

    if modified:
        db.commit()
