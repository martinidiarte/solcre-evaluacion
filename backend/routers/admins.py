from fastapi import Depends, HTTPException

from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, select

from security import create_access_token, hash_password, verify_password, get_current_admin
from db.connection import get_db
from db.models import Admin

from schemas.admin import AdminLogin, AdminPasswordChange, AdminTokenResponse

from fastapi import APIRouter

router = APIRouter()

@router.post("/admin/login", response_model=AdminTokenResponse)
def login(datos: AdminLogin, db: Session = Depends(get_db)):
    consulta = select(Admin).where(Admin.email == datos.email)
    admin = db.scalars(consulta).first()

    if admin is None:
        raise HTTPException(
            status_code = 401,
            detail = "Credenciales incorrectas"
        )

    if not verify_password(datos.password, admin.password_hash):
        raise HTTPException(
            status_code = 401,
            detail = "Credenciales incorrectas"
        )

    token = create_access_token(admin.id)
    
    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.post("/admin/change-password", status_code=200)
def change_password(datos: AdminPasswordChange, db: Session = Depends(get_db),
                    admin: Admin = Depends(get_current_admin)):

    if not verify_password(datos.old_password, admin.password_hash):
        raise HTTPException(
            status_code = 401,
            detail = "Contraseña incorrecta"
        )

    if datos.old_password == datos.new_password:
        raise HTTPException(
            status_code = 400,
            detail = "La nueva contraseña debe ser diferente a la actual"
        )
    
    if not datos.new_password == datos.confirm_new_password:
        raise HTTPException(
            status_code = 400,
            detail = "Las contraseñas no coinciden"
        )

    admin.password_hash = hash_password(datos.new_password)
    
    db.commit()
		
    return {"message": "Contraseña actualizada correctamente"}