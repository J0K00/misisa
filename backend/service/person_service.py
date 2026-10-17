from sqlalchemy.orm import Session
from uuid import UUID
from repository.person_repository import PersonRepository
from exception.global_exceptions import NotFoundException
from dto.person_dto import PersonCreate, PersonUpdate

class PersonService:
    def __init__(self, db: Session):
        self.repo = PersonRepository(db)

    def get_family_members(self, family_id: UUID, user_id: UUID):
        # Todo: check if viewer
        return self.repo.get_by_family(family_id)

    def create_person(self, person: PersonCreate, user_id: UUID, current_user = None):
        from entity.family_membership_entity import FamilyMembershipEntity
        from exception.global_exceptions import ForbiddenException
        from security.session_tracker import is_session_used, mark_session_used
        from service.union_service import validate_child_and_parents_age, align_union_children
        
        is_authorized = False
        if current_user and getattr(current_user, "is_guest", False):
            if current_user.family_id == person.family_id and current_user.role == "EDITOR":
                # Vérifier si la session d'édition a déjà été utilisée (usage unique)
                if is_session_used(getattr(current_user, "session_id", None)):
                    raise ForbiddenException("Votre droit d'édition à usage unique a déjà été utilisé pour ajouter un membre. Votre session est désormais en lecture seule.")
                is_authorized = True
        else:
            membership = self.repo.db.query(FamilyMembershipEntity).filter(
                FamilyMembershipEntity.family_id == person.family_id,
                FamilyMembershipEntity.user_id == user_id
            ).first()
            if membership and membership.role in ["PATRIARCH", "EDITOR"]:
                is_authorized = True

        if not is_authorized:
            raise ForbiddenException("Droits insuffisants pour ajouter un membre.")

        # Si l'enfant est relié à une union parent, valider les âges avant création
        if getattr(person, 'parent_union_id', None):
            validate_child_and_parents_age(self.repo.db, person.parent_union_id, person.birth_date)
            
        # Auto-offset to prevent stacking
        from entity.person_entity import PersonEntity
        count = self.repo.db.query(PersonEntity).filter(PersonEntity.family_id == person.family_id).count()
        if person.x == 0 and person.y == 0:
            person.x = (count % 5) * 350
            person.y = (count // 5) * 200
            
        created_person = self.repo.create(person)

        if getattr(person, 'parent_union_id', None):
            from entity.union_entity import UnionChildrenEntity
            union_child = UnionChildrenEntity(union_id=person.parent_union_id, child_id=created_person.id)
            self.repo.db.add(union_child)
            self.repo.db.commit()

        # Recalculer et appliquer le positionnement hiérarchique de l'arbre
        from service.family_layout import apply_family_layout
        apply_family_layout(self.repo.db, person.family_id)
        self.repo.db.refresh(created_person)

        # Si invité avec rôle EDITOR, marquer la session comme consommée
        if current_user and getattr(current_user, "is_guest", False) and current_user.role == "EDITOR":
            mark_session_used(getattr(current_user, "session_id", None))

        from repository.person_repository import to_person_response
        return to_person_response(created_person)

    def update_person(self, person_id: UUID, person_dto: PersonUpdate, user_id: UUID, current_user = None):
        from entity.family_membership_entity import FamilyMembershipEntity
        from exception.global_exceptions import ForbiddenException, NotFoundException
        from repository.person_repository import to_person_response

        person_entity = self.repo.get_by_id(person_id)
        if not person_entity:
            raise NotFoundException("Membre introuvable.")

        # Only PATRIARCH can edit member details
        is_patriarch = False
        if not (current_user and getattr(current_user, "is_guest", False)):
            membership = self.repo.db.query(FamilyMembershipEntity).filter(
                FamilyMembershipEntity.family_id == person_entity.family_id,
                FamilyMembershipEntity.user_id == user_id
            ).first()
            if membership and membership.role == "PATRIARCH":
                is_patriarch = True

        if not is_patriarch:
            raise ForbiddenException("Seul le Patriarche peut modifier les informations d'un membre.")

        updated = self.repo.update(person_entity, person_dto)
        return to_person_response(updated)
