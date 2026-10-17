import unittest
import sys
import os
from datetime import date
from uuid import uuid4

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dto.person_dto import PersonResponse

class TestPersonDTO(unittest.TestCase):
    def test_age_calculation_living_person(self):
        """Vérifie le calcul dynamique de l'âge pour une personne vivante."""
        today = date.today()
        # Né il y a exactement 25 ans jour pour jour
        try:
            birth = date(today.year - 25, today.month, today.day)
        except ValueError:
            # Gestion du cas bissextile 29 février
            birth = date(today.year - 25, today.month, today.day - 1)

        person = PersonResponse(
            id=uuid4(),
            family_id=uuid4(),
            first_name="Jean",
            last_name="Kowa",
            birth_date=birth,
            death_date=None,
            gender="M",
            photos=[]
        )
        self.assertEqual(person.age, 25)

    def test_age_calculation_deceased_person(self):
        """Vérifie le calcul de l'âge au décès."""
        person = PersonResponse(
            id=uuid4(),
            family_id=uuid4(),
            first_name="Grand-Père",
            last_name="Kowa",
            birth_date=date(1930, 5, 10),
            death_date=date(2010, 5, 9), # Décédé 1 jour avant ses 80 ans -> 79 ans
            gender="M",
            photos=[]
        )
        self.assertEqual(person.age, 79)

        person_after_birthday = PersonResponse(
            id=uuid4(),
            family_id=uuid4(),
            first_name="Grand-Mère",
            last_name="Kowa",
            birth_date=date(1930, 5, 10),
            death_date=date(2010, 5, 11), # Décédée 1 jour après son anniversaire -> 80 ans
            gender="F",
            photos=[]
        )
        self.assertEqual(person_after_birthday.age, 80)

if __name__ == "__main__":
    unittest.main()
