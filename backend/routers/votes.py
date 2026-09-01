from fastapi import Depends, HTTPException, Query

from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, select

from db.connection import get_db
from db.models import Admin, Voter, Vote

from security.security import get_current_admin

from schemas.vote import VoteCreate, VoteDetailResponse, VotePageResponse, VoteResponse

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

    return voto

# Obtener los votos paginados, del más reciente al más antiguo
@router.get("/votes", response_model=VotePageResponse)
def get_votes(page: int = Query(1, ge=1),
              page_size: int = Query(15, ge=1, le=100),
              db: Session = Depends(get_db),
              admin: Admin = Depends(get_current_admin)):
    # Uso alias para poder hacer join de la misma tabla Voter dos veces, una para el votante y otra para el candidato
    Votante = aliased(Voter)
    Candidato = aliased(Voter)

    consulta = (select(Vote.id, Votante.name.label("voter_name"), Votante.last_name.label("voter_last_name"), 
                        Votante.document.label("voter_document"),
                        Candidato.name.label("candidate_name"), Candidato.last_name.label("candidate_last_name"),
                        Vote.voted_at)
                    .join(Votante, Vote.voter_id == Votante.id)
                    .join(Candidato, Vote.candidate_id == Candidato.id)
                    .order_by(Vote.voted_at.desc(), Vote.id.desc())
                    .offset((page - 1) * page_size)
                    .limit(page_size))
    votos = db.execute(consulta).mappings().all()

    total = db.scalar(select(func.count(Vote.id))) or 0
    total_pages = (total + page_size - 1) // page_size

    return {
        "items": votos,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages
    }

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
