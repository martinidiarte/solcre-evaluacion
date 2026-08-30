from pwdlib import PasswordHash

# Usa un algoritmo recomendado para el hashing de contraseñas
password_hash = PasswordHash.recommended()

# Función para hashear la contraseña
def hash_password(password: str):
    return password_hash.hash(password)

# Función para verificar la contraseña
def verify_password(password: str, hashed_password: str):
    return password_hash.verify(password, hashed_password)