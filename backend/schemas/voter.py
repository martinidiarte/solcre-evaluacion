from datetime import date, datetime

from enum import Enum

import re

from pydantic import BaseModel, field_validator

class Sex(str, Enum):
    masculino = "Masculino"
    femenino = "Femenino"
    otro = "Otro"

class VoterCreate(BaseModel):
    name: str
    last_name: str
    document: str
    dob: date
    is_candidate: bool
    address: str
    telephone_number: str
    sex: Sex

    # Validar no vacio
    @field_validator(
        'name',
        'last_name',
        'document',
        'address',
        'telephone_number'
    )
    @classmethod
    def validate_not_empty(cls, value: str):
        value = value.strip()

        if not value:
            raise ValueError('El campo no puede estar vacío')

        return value
    
    # Telefono solo acepta numeros
    @field_validator('telephone_number')
    @classmethod
    def validate_phone(cls, value: str):
        if not value.isdigit():
            raise ValueError('El teléfono debe contener solo números')

        return value

    # Nombres y Apellidos validos usando expresiones regulares
    @field_validator('name', 'last_name')
    @classmethod
    def validate_name(cls, value: str):
        if not re.fullmatch(r"[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+", value):
            raise ValueError('El nombre y apellido solo pueden contener letras y espacios')

        return value

    # No permitir fechas futuras
    @field_validator('dob')
    @classmethod
    def validate_dob(cls, value: date):
        if value > date.today():
            raise ValueError(
                'La fecha de nacimiento no puede ser futura'
            )

        return value

    # No permitir menores de 18 años
    @field_validator('dob')
    @classmethod
    def validate_adult(cls, value: date):
        today = date.today()
        age = today.year - value.year

        if (today.month, today.day) < (value.month, value.day):
            age -= 1

        if age < 18:
            raise ValueError('El votante debe ser mayor de 18 años')

        return value

# Votantes que son candidatos
class CandidateResponse(BaseModel):
    id: int
    name: str
    last_name: str

    # Para que Pydantic pueda crear un modelo a partir de un objeto ORM
    model_config = {
        "from_attributes": True
    }

# Votantes
class VotersResponse(BaseModel):
    id: int
    name: str
    last_name: str
    is_candidate: bool
    document: str
    sex: str
    dob : datetime
    telephone_number: str

    # Para que Pydantic pueda crear un modelo a partir de un objeto ORM
    model_config = {
        "from_attributes": True
    }

# Modelo para crear un voto
class VoteCreate(BaseModel):
    document: str
    candidate_id: int

class RankingResponse(BaseModel):
    id: int
    name: str
    last_name: str
    number_votes : int

    # Para que Pydantic pueda crear un modelo a partir de un objeto ORM
    model_config = {
        "from_attributes": True
    }