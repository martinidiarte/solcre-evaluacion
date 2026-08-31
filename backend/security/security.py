from pwdlib import PasswordHash

import os

from datetime import datetime, timedelta, timezone

import jwt
from jwt import ExpiredSignatureError, InvalidTokenError

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from fastapi import Depends, HTTPException

from sqlalchemy import select
from sqlalchemy.orm import Session

from db.connection import get_db
from db.models import Admin

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 60

# Usa un algoritmo recomendado para el hashing de contraseñas
password_hash = PasswordHash.recommended()

# Define un esquema de seguridad para la autenticación HTTP Bearer
security = HTTPBearer()

# Función para hashear la contraseña
def hash_password(password: str):
    return password_hash.hash(password)

# Función para verificar la contraseña
def verify_password(password: str, hashed_password: str):
    return password_hash.verify(password, hashed_password)

# Función para crear un token JWT
def create_access_token(admin_id: int):
    datos_token = {
        "sub": str(admin_id),
        "exp": datetime.now(timezone.utc) + timedelta(
            minutes=JWT_EXPIRATION_MINUTES
        )
    } 
    # encode codifica el token con la clave secreta y el algoritmo especificado
    token = jwt.encode(
        datos_token,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

    return token

# Función para decodificar un token JWT
def decode_access_token(token: str):
    try:
        datos = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        admin_id = datos.get("sub")

        if admin_id is None:
            return None

        return int(admin_id)

    except (ExpiredSignatureError, InvalidTokenError):
        return None

# Función para obtener el ID del administrador actual a partir del token
def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    admin_id = decode_access_token(token)

    if admin_id is None:
        raise HTTPException(
            status_code=401,
            detail="Token inválido o expirado"
        )

    consulta = select(Admin).where(Admin.id == admin_id)
    admin = db.scalars(consulta).first()

    if admin is None:
        raise HTTPException(
            status_code=401,
            detail="Administrador no válido"
        )

    return admin

