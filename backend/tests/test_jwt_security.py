import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from security.jwt_handler import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)

class TestJWTSecurity(unittest.TestCase):
    def test_password_hashing_and_verification(self):
        """Vérifie le hachage sécurisé Bcrypt et la vérification."""
        password = "MonMotDePasseSecret123!"
        hashed = get_password_hash(password)
        
        self.assertNotEqual(password, hashed)
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password("MauvaisMotDePasse", hashed))

    def test_access_token_creation_and_decoding(self):
        """Vérifie la création et le décodage d'un jeton d'accès JWT."""
        payload_data = {"sub": "user@example.com", "role": "ADMIN", "family_id": "test-uuid"}
        token = create_access_token(payload_data)
        
        self.assertIsInstance(token, str)
        decoded = decode_token(token)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded.get("sub"), "user@example.com")
        self.assertEqual(decoded.get("role"), "ADMIN")
        self.assertEqual(decoded.get("type"), "access")
        self.assertIn("exp", decoded)

    def test_refresh_token_type(self):
        """Vérifie que le jeton de rafraîchissement a bien le type refresh."""
        payload_data = {"sub": "user@example.com"}
        token = create_refresh_token(payload_data)
        decoded = decode_token(token)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded.get("type"), "refresh")

    def test_invalid_token(self):
        """Vérifie qu'un jeton corrompu retourne None."""
        self.assertIsNone(decode_token("token.invalide.aleatoire"))

if __name__ == "__main__":
    unittest.main()
