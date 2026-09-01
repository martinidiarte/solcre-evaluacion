from datetime import date, datetime

from pydantic import BaseModel, field_validator

# Modelo para crear un voto
class VoteCreate(BaseModel):
    document: str
    candidate_id: int

    @field_validator('document')
    @classmethod
    def validate_document(cls, value: str):
        value = value.strip()

        if not value:
            raise ValueError('El documento no puede estar vacío')

        return value

# Modelo para la respuesta de un voto
class VoteListResponse(BaseModel):
    id: int

    voter_name: str
    voter_last_name: str

    candidate_name: str
    candidate_last_name: str

    voted_at: datetime

    model_config = {
        "from_attributes": True
    }

# Para manejar la paginación de los votos
class VotePageResponse(BaseModel):
    items: list[VoteListResponse]
    page: int
    page_size: int
    total: int
    total_pages: int

class VoteResponse(BaseModel):
    id: int
    voter_id: int
    candidate_id: int
    voted_at: datetime

    model_config = {
        "from_attributes": True
    }

class VoteDetailResponse(BaseModel):
    id: int

    voter_name: str
    voter_last_name: str
    voter_document: str
    voter_dob: date
    voter_address: str
    voter_telephone_number: str
    voter_sex: str

    candidate_name: str
    candidate_last_name: str

    voted_at: datetime

