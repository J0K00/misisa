from sqlalchemy.orm import Session
from uuid import UUID
from entity.union_entity import UnionEntity
from dto.union_dto import UnionCreate
from exception.global_exceptions import ForbiddenException, NotFoundException

def parse_date_value(date_val):
    if not date_val:
        return None
    from security.encryption import decrypt_value
    dec = decrypt_value(str(date_val))
    if not dec:
        return None
    from datetime import date
    try:
        return date.fromisoformat(str(dec)[:10])
    except Exception:
        return None

def validate_child_and_parents_age(db, union_id: UUID, child_birth_date):
    from entity.union_entity import UnionEntity
    from entity.person_entity import PersonEntity
    from exception.global_exceptions import BadRequestException, NotFoundException

    union = db.query(UnionEntity).filter(UnionEntity.id == union_id).first()
    if not union:
        raise NotFoundException("Union introuvable.")

    p1 = db.query(PersonEntity).filter(PersonEntity.id == union.partner_1_id).first()
    p2 = db.query(PersonEntity).filter(PersonEntity.id == union.partner_2_id).first()
    if not p1 or not p2:
        raise NotFoundException("Parents de l'union introuvables.")

    mother = p1 if p1.gender == "F" else (p2 if p2.gender == "F" else None)
    father = p1 if p1.gender == "M" else (p2 if p2.gender == "M" else None)

    c_date = parse_date_value(child_birth_date)
    if not c_date:
        return

    m_date = parse_date_value(mother.birth_date) if mother else None
    f_date = parse_date_value(father.birth_date) if father else None

    # L'enfant d'une union ne peut pas avoir un âge supérieur à ses parents
    if f_date and c_date <= f_date:
        raise BadRequestException("L'enfant d'une union ne peut pas être né avant son père ou avoir un âge supérieur.")
    if m_date and c_date <= m_date:
        raise BadRequestException("L'enfant d'une union ne peut pas être né avant sa mère ou avoir un âge supérieur.")

    # Écart d'au moins 12 ans avec la mère (critère historique)
    if m_date:
        mother_gap = c_date.year - m_date.year - ((c_date.month, c_date.day) < (m_date.month, m_date.day))
        if mother_gap < 12:
            raise BadRequestException("L'écart d'âge entre la mère et l'enfant doit être d'au moins 12 ans. (Selon l'histoire médicale, le cas le plus précoce jamais documenté est celui de Lina Medina à 5 ans et 7 mois).")

def align_union_children(db, union_id: UUID):
    from entity.union_entity import UnionEntity, UnionChildrenEntity
    from entity.person_entity import PersonEntity

    union = db.query(UnionEntity).filter(UnionEntity.id == union_id).first()
    if not union:
        return

    p1 = db.query(PersonEntity).filter(PersonEntity.id == union.partner_1_id).first()
    p2 = db.query(PersonEntity).filter(PersonEntity.id == union.partner_2_id).first()
    if not p1 or not p2 or p1.x is None or p2.x is None:
        return

    left_x = min(p1.x, p2.x)
    right_x = max(p1.x, p2.x)
    union_mid_x = (left_x + 200 + right_x) / 2
    children_y = max(p1.y or 0, p2.y or 0) + 240

    child_links = db.query(UnionChildrenEntity).filter(UnionChildrenEntity.union_id == union_id).all()
    if not child_links:
        return

    child_ids = [cl.child_id for cl in child_links]
    children = db.query(PersonEntity).filter(PersonEntity.id.in_(child_ids)).all()
    children = sorted(children, key=lambda c: child_ids.index(c.id))

    n = len(children)
    spacing = 260
    for i, child in enumerate(children):
        child.x = int(union_mid_x - ((n - 1) * spacing) / 2 + i * spacing - 100)
        child.y = int(children_y)

    db.commit()

class UnionService:
    def __init__(self, db: Session):
        self.db = db

    def create_union(self, union_dto: UnionCreate, user_id: UUID, current_user = None):
        from entity.family_membership_entity import FamilyMembershipEntity
        
        is_authorized = False
        if current_user and getattr(current_user, "is_guest", False):
            if current_user.family_id == union_dto.family_id and current_user.role == "EDITOR":
                is_authorized = True
        else:
            membership = self.db.query(FamilyMembershipEntity).filter(
                FamilyMembershipEntity.family_id == union_dto.family_id,
                FamilyMembershipEntity.user_id == user_id
            ).first()
            if membership and membership.role in ["PATRIARCH", "EDITOR"]:
                is_authorized = True

        if not is_authorized:
            raise ForbiddenException("Droits insuffisants pour créer une union dans cette famille.")

        from entity.person_entity import PersonEntity
        from exception.global_exceptions import BadRequestException
        
        p1 = self.db.query(PersonEntity).filter(PersonEntity.id == union_dto.partner_1_id).first()
        p2 = self.db.query(PersonEntity).filter(PersonEntity.id == union_dto.partner_2_id).first()
        if not p1 or not p2:
            raise NotFoundException("Partenaire introuvable.")

        # L'union doit se faire uniquement entre un homme et une femme
        genders = {p1.gender, p2.gender}
        if genders != {"M", "F"}:
            raise BadRequestException("L'union doit se faire exclusivement entre un homme et une femme.")

        # Un membre ne peut faire partie que d'une seule union
        existing_union = self.db.query(UnionEntity).filter(
            (UnionEntity.partner_1_id == union_dto.partner_1_id) |
            (UnionEntity.partner_2_id == union_dto.partner_1_id) |
            (UnionEntity.partner_1_id == union_dto.partner_2_id) |
            (UnionEntity.partner_2_id == union_dto.partner_2_id)
        ).first()
        if existing_union:
            raise BadRequestException("Un membre ne peut faire partie que d'une seule union.")

        union = UnionEntity(
            partner_1_id=union_dto.partner_1_id,
            partner_2_id=union_dto.partner_2_id,
            marriage_date=union_dto.marriage_date,
            divorce_date=union_dto.divorce_date
        )
        self.db.add(union)
        self.db.commit()
        self.db.refresh(union)

        from service.family_layout import apply_family_layout
        apply_family_layout(self.db, p1.family_id)

        return union

    def add_child(self, union_id: UUID, child_id: UUID, user_id: UUID, current_user = None):
        from entity.family_membership_entity import FamilyMembershipEntity
        from entity.union_entity import UnionChildrenEntity, UnionEntity
        from entity.person_entity import PersonEntity

        union = self.db.query(UnionEntity).filter(UnionEntity.id == union_id).first()
        if not union:
            raise NotFoundException("Union introuvable.")
            
        p1 = self.db.query(PersonEntity).filter(PersonEntity.id == union.partner_1_id).first()
        if not p1:
            raise NotFoundException("Partenaire introuvable.")
            
        is_authorized = False
        if current_user and getattr(current_user, "is_guest", False):
            if current_user.family_id == p1.family_id and current_user.role == "EDITOR":
                is_authorized = True
        else:
            membership = self.db.query(FamilyMembershipEntity).filter(
                FamilyMembershipEntity.family_id == p1.family_id,
                FamilyMembershipEntity.user_id == user_id
            ).first()
            if membership and membership.role in ["PATRIARCH", "EDITOR"]:
                is_authorized = True

        if not is_authorized:
            raise ForbiddenException("Droits insuffisants pour ajouter une naissance.")

        if current_user and getattr(current_user, "is_guest", False) and current_user.role == "EDITOR":
            from security.session_tracker import is_session_used, mark_session_used
            if is_session_used(getattr(current_user, "session_id", None)):
                raise ForbiddenException("Votre session d'édition unique a déjà été utilisée.")

        child = self.db.query(PersonEntity).filter(PersonEntity.id == child_id).first()
        if not child:
            raise NotFoundException("Enfant introuvable.")

        # Validation des contraintes d'âge
        validate_child_and_parents_age(self.db, union_id, child.birth_date)

        # Vérifier si l'enfant est déjà lié à une union (un enfant ne peut avoir qu'une seule union parentale)
        already_child = self.db.query(UnionChildrenEntity).filter(
            UnionChildrenEntity.child_id == child_id
        ).first()
        if already_child:
            raise BadRequestException("Ce membre est déjà enregistré comme enfant d'une union.")

        union_child = UnionChildrenEntity(union_id=union_id, child_id=child_id)
        self.db.add(union_child)
        self.db.commit()

        # Aligner tous les enfants sous la branche de l'union
        from service.family_layout import apply_family_layout
        apply_family_layout(self.db, p1.family_id)

        # Si invité avec rôle EDITOR, marquer la session comme consommée
        if current_user and getattr(current_user, "is_guest", False) and current_user.role == "EDITOR":
            from security.session_tracker import mark_session_used
            mark_session_used(getattr(current_user, "session_id", None))

        return {"message": "Enfant ajouté et aligné à l'union avec succès"}
