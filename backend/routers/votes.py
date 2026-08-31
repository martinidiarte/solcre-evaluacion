from fastapi import Depends, HTTPException

from sqlalchemy.orm import Session, aliased
from sqlalchemy import select

from db.connection import get_db
from db.models import Admin, Voter, Vote

from security.security import get_current_admin

from schemas.vote import VoteCreate, VoteDetailResponse, VoteListResponse, VoteResponse

from fastapi import APIRouter


router = APIRouter()

# Crear un voto
@router.post("/votes", response_model=VoteResponse, status_code=201)
def create_vote(datos: VoteCreate, db: Session = Depends(get_db)):
    #Verificar existencia del votante
    consulta = select(Voter).where(Voter.document == datos.document)
    votante = db.scalars(consulta).first()

    if votante is None:
        raise HTTPException(
            status_code = 404,
            detail = "Votante no encontrado"
        )
    
    #Verificar existencia del candidato
    consulta = select(Voter).where(Voter.id == datos.candidate_id, Voter.is_candidate.is_(True))
    candidato = db.scalars(consulta).first()

    if candidato is None:
        raise HTTPException(
            status_code = 404,
            detail = "Candidato no encontrado"
        )

    #Verificar si el votante ya ha votado
    consulta = select(Vote).where(Vote.voter_id == votante.id)
    voto_existente = db.scalars(consulta).first()

    if voto_existente is not None:
        raise HTTPException(
            status_code = 409,
            detail = "El votante ya ha votado"
        )

    # Crear el voto
    voto = Vote(voter_id=votante.id, candidate_id=candidato.id)
    # Agregar el voto a la base de datos
    db.add(voto)
    db.commit()
    db.refresh(voto)

#FALTA MENSAJE DE EXITO?

    return voto

# Obtener todos los votos
@router.get("/votes", response_model=list[VoteListResponse])
def get_votes(db: Session = Depends(get_db),
              admin: Admin = Depends(get_current_admin)):
    # Uso alias para poder hacer join de la misma tabla Voter dos veces, una para el votante y otra para el candidato
    Votante = aliased(Voter)
    Candidato = aliased(Voter)

    consulta = (select(Vote.id, Votante.name.label("voter_name"), Votante.last_name.label("voter_last_name"), 
                        Votante.document.label("voter_document"),
                        Candidato.name.label("candidate_name"), Candidato.last_name.label("candidate_last_name"),
                        Vote.voted_at)
                    .join(Votante, Vote.voter_id == Votante.id)
                    .join(Candidato, Vote.candidate_id == Candidato.id))
    votos = db.execute(consulta).mappings().all()

    return votos

# Obtener detalle de un voto
@router.get("/votes/{id}", response_model=VoteDetailResponse)
def get_vote(id: int, db: Session = Depends(get_db),
             admin: Admin = Depends(get_current_admin)):
    # Uso alias para poder hacer join de la misma tabla Voter dos veces, una para el votante y otra para el candidato
    Votante = aliased(Voter)
    Candidato = aliased(Voter)

    consulta = (select(Vote.id, Votante.name.label("voter_name"), Votante.last_name.label("voter_last_name"), 
                        Votante.document.label("voter_document"), Votante.dob.label("voter_dob"), Votante.address.label("voter_address"), 
                        Votante.telephone_number.label("voter_telephone_number"), Votante.sex.label("voter_sex"),
                        Candidato.name.label("candidate_name"), Candidato.last_name.label("candidate_last_name"),
                        Vote.voted_at)
                    .join(Votante, Vote.voter_id == Votante.id)
                    .join(Candidato, Vote.candidate_id == Candidato.id).where(Vote.id == id))
    voto = db.execute(consulta).mappings().first()

    if voto is None:
        raise HTTPException(
            status_code = 404,
            detail = "Voto no encontrado"
        )

    return voto
