import os
import base64
import hashlib
from cryptography.fernet import Fernet

# Use JWT_SECRET or ENCRYPTION_KEY to derive a deterministic 32-byte Fernet key
_secret = os.getenv("ENCRYPTION_KEY", os.getenv("JWT_SECRET", "super-secret-roots-encryption-key-2026"))
_key = base64.urlsafe_b64encode(hashlib.sha256(_secret.encode("utf-8")).digest())
_cipher = Fernet(_key)

def encrypt_value(val: str | None) -> str | None:
    if val is None or val == "":
        return None
    try:
        return _cipher.encrypt(val.encode("utf-8")).decode("utf-8")
    except Exception as e:
        print(f"Encryption error: {e}")
        return val

def decrypt_value(val: str | None) -> str | None:
    if val is None or val == "":
        return None
    try:
        return _cipher.decrypt(val.encode("utf-8")).decode("utf-8")
    except Exception:
        # If already plaintext (e.g. before migration), return as is
        return val
