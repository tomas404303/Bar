import hashlib, os

def encriptar_contraseña(password: str) -> str:
    salt = os.urandom(16).hex()
    hash_value = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
    return f"{salt}${hash_value}"

def verificar_contraseña(password: str, hashed: str) -> bool:
    try:
        salt, hash_value = hashed.split('$')
        check_hash = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
        return check_hash == hash_value
    except Exception:
        return False
