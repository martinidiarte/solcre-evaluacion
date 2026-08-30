from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel

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