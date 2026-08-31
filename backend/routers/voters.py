from fastapi import Depends, HTTPException

from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, select

from security import get_current_admin
from db.connection import get_db
from db.models import Admin, Voter, Vote

from schemas.voter import CandidateResponse, RankingResponse, VoterCreate, VotersResponse

from fastapi import APIRouter

router = APIRouter()

@router.post("/voter", response_model=VotersResponse, status_code=201)
def create_voter(datos: VoterCreate, db: Session = Depends(get_db),
                    admin: Admin = Depends(get_current_admin)):
    # Verificar si el votante ya existe
    consulta = select(Voter).where(Voter.document == datos.document)
    votante_existente = db.scalars(consulta).first()

    if votante_existente is not None:
        raise HTTPException(
            status_code = 409,
            detail = "El votante ya existe"
        )

    # Crear el votante
    votante = Voter(
        name=datos.name,
        last_name=datos.last_name,
        document=datos.document,
        dob=datos.dob,
        is_candidate=datos.is_candidate,
        address=datos.address,
        telephone_number=datos.telephone_number,
        sex=datos.sex
    )

    # Agregar el votante
    db.add(votante)
    db.commit() 
    db.refresh(votante)

    return votante

# Obtener todos los votantes que son candidatos
@router.get("/candidates", response_model=list[CandidateResponse])
def get_candidates(db: Session = Depends(get_db)):
    consulta = select(Voter).where(Voter.is_candidate.is_(True))
    candidatos = db.scalars(consulta).all()

    return candidatos

# Obtener un votante específico
@router.get("/voters/{document}", response_model=VotersResponse)
def get_voter(document: str, db: Session = Depends(get_db),
                admin: Admin = Depends(get_current_admin)):  
    consulta = select(Voter).where(Voter.document == document)
    votante = db.scalars(consulta).first()
    
    if votante is None:
        raise HTTPException(
            status_code = 404,
            detail = "Votante no encontrado"
        )

    return votante

# Obtener todos los votantes
@router.get("/voters", response_model=list[VotersResponse])
def get_voters(db: Session = Depends(get_db),
                admin: Admin = Depends(get_current_admin)):
    consulta = select(Voter)
    votantes = db.scalars(consulta).all()

    return votantes

# Obtener candidatos mas votados (top 5)
@router.get("/candidates/most-voted", response_model=list[RankingResponse])
def get_most_voted_candidates(db: Session = Depends(get_db),
                                admin: Admin = Depends(get_current_admin)):
    consulta = select(Vote)

    # Ordenar por número de votos, limito a 5 candidatos y devuelvo la lista de candidatos con sus respectivos votos
    consulta = (select(Voter.id, Voter.name, Voter.last_name, func.count(Vote.id).label("number_votes"))
                .outerjoin(Vote, Vote.candidate_id == Voter.id)
                .where(Voter.is_candidate.is_(True))
                .group_by(Voter.id, Voter.name, Voter.last_name)
                .order_by(func.count(Vote.id).desc()) 
                .limit(5)
    )

    resultados = db.execute(consulta).mappings().all()

    return resultados

