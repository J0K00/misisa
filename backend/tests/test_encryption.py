import unittest
import sys
import os

# Ajouter le chemin racine du backend au sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from security.encryption import encrypt_value, decrypt_value

class TestEncryptionUtils(unittest.TestCase):
    def test_encrypt_decrypt_roundtrip(self):
        """Vérifie qu'une chaîne chiffrée puis déchiffrée redonne la valeur originale."""
        secret_text = "Fils légitime adopté en 1995"
        encrypted = encrypt_value(secret_text)
        self.assertIsNotNone(encrypted)
        self.assertNotEqual(encrypted, secret_text)
        
        decrypted = decrypt_value(encrypted)
        self.assertEqual(decrypted, secret_text)

    def test_encrypt_none_and_empty(self):
        """Vérifie que None et les chaînes vides sont préservés."""
        self.assertIsNone(encrypt_value(None))
        self.assertIsNone(decrypt_value(None))
        self.assertIsNone(encrypt_value(""))
        self.assertIsNone(decrypt_value(""))

    def test_decrypt_plaintext_fallback(self):
        """Vérifie que si une valeur non chiffrée est passée à decrypt_value, elle est retournée sans crash."""
        plaintext = "texte_non_chiffre_legacy"
        result = decrypt_value(plaintext)
        self.assertEqual(result, plaintext)

if __name__ == "__main__":
    unittest.main()
