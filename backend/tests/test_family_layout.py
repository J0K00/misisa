import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from service.family_layout import compute_hierarchical_layout, CARD_WIDTH, COUPLE_GAP, LAYER_GAP, START_Y

class TestFamilyLayout(unittest.TestCase):
    def test_empty_layout(self):
        """Vérifie qu'un arbre vide retourne un dictionnaire vide."""
        layout = compute_hierarchical_layout([], [], [])
        self.assertEqual(layout, {})

    def test_single_person_layout(self):
        """Vérifie le positionnement d'une personne seule."""
        person = {"id": "p1", "first_name": "Solo", "last_name": "Test", "gender": "M"}
        layout = compute_hierarchical_layout([person], [], [])
        
        self.assertIn("p1", layout)
        self.assertEqual(layout["p1"]["y"], START_Y)
        self.assertGreaterEqual(layout["p1"]["x"], 60)

    def test_couple_layout_adjacency(self):
        """Vérifie que deux conjoints sont positionnés côte à côte avec le gap approprié."""
        p1 = {"id": "p1", "first_name": "Adam", "last_name": "Test", "gender": "M"}
        p2 = {"id": "p2", "first_name": "Eve", "last_name": "Test", "gender": "F"}
        union = {"id": "u1", "partner_1_id": "p1", "partner_2_id": "p2"}

        layout = compute_hierarchical_layout([p1, p2], [union], [])

        self.assertIn("p1", layout)
        self.assertIn("p2", layout)
        # Même ordonnée Y
        self.assertEqual(layout["p1"]["y"], layout["p2"]["y"])
        # Espacement exact entre les cartes du couple (CARD_WIDTH + COUPLE_GAP)
        self.assertEqual(layout["p2"]["x"] - layout["p1"]["x"], CARD_WIDTH + COUPLE_GAP)

    def test_hierarchical_generations_alignment(self):
        """Vérifie que les enfants sont situés un niveau plus bas (LAYER_GAP)."""
        p1 = {"id": "p1", "first_name": "Pere", "last_name": "Famille", "gender": "M"}
        p2 = {"id": "p2", "first_name": "Mere", "last_name": "Famille", "gender": "F"}
        child = {"id": "c1", "first_name": "Enfant", "last_name": "Famille", "gender": "M"}
        
        union = {"id": "u1", "partner_1_id": "p1", "partner_2_id": "p2"}
        union_child = {"union_id": "u1", "child_id": "c1"}

        layout = compute_hierarchical_layout([p1, p2, child], [union], [union_child])

        # Parents au niveau initial
        self.assertEqual(layout["p1"]["y"], START_Y)
        self.assertEqual(layout["p2"]["y"], START_Y)
        # Enfant au niveau suivant
        self.assertEqual(layout["c1"]["y"], START_Y + LAYER_GAP)

    def test_anti_enjambement_married_child_and_sibling(self):
        """
        Vérifie qu'un enfant marié reste contigu avec son conjoint,
        et qu'un frère/soeur célibataire est positionné APRÈS le couple marié (pas au milieu).
        """
        father = {"id": "p1", "first_name": "Pere", "last_name": "Kowa", "gender": "M"}
        mother = {"id": "p2", "first_name": "Mere", "last_name": "Kowa", "gender": "F"}
        parent_union = {"id": "u_parents", "partner_1_id": "p1", "partner_2_id": "p2"}

        daughter = {"id": "c_daughter", "first_name": "Fille", "last_name": "Kowa", "gender": "F"}
        son_sibling = {"id": "c_son", "first_name": "Fils", "last_name": "Kowa", "gender": "M"}
        son_in_law = {"id": "in_law", "first_name": "Gendre", "last_name": "Simbi", "gender": "M"}

        # Union fille + gendre
        child_union = {"id": "u_child", "partner_1_id": "c_daughter", "partner_2_id": "in_law"}

        persons = [father, mother, daughter, son_sibling, son_in_law]
        unions = [parent_union, child_union]
        children = [
            {"union_id": "u_parents", "child_id": "c_daughter"},
            {"union_id": "u_parents", "child_id": "c_son"},
        ]

        layout = compute_hierarchical_layout(persons, unions, children)

        daughter_x = layout["c_daughter"]["x"]
        in_law_x = layout["in_law"]["x"]
        sibling_x = layout["c_son"]["x"]

        # Le gendre et la fille doivent être immédiatement adjacents
        couple_left = min(daughter_x, in_law_x)
        couple_right = max(daughter_x, in_law_x)
        self.assertEqual(couple_right - couple_left, CARD_WIDTH + COUPLE_GAP)

        # Le frère ne doit JAMAIS être inséré entre les deux conjoints
        self.assertFalse(couple_left < sibling_x < couple_right, "Le frère s'est intercalé entre les conjoints !")

if __name__ == "__main__":
    unittest.main()
