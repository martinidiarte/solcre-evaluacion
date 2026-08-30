from fastapi import FastAPI, Depends, HTTPException

from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, select

from db.connection import get_db
from db.models import Voter, Vote

from schemas.vote import VoteCreate, VoteDetailResponse, VoteListResponse, VoteResponse
from schemas.voter import CandidateResponse, RankingResponse, VoterCreate, VotersResponse

app = FastAPI()


@app.get("/")
def root():
    return {"message": "API de Solcre funcionando"}

# Obtener todos los votantes que son candidatos
@app.get("/candidates", response_model=list[CandidateResponse])
def get_candidates(db: Session = Depends(get_db)):
    consulta = select(Voter).where(Voter.is_candidate.is_(True))
    candidatos = db.scalars(consulta).all()

    return candidatos

# Obtener un votante específico
@app.get("/voters/{document}", response_model=VotersResponse)
def get_voter(document: str, db: Session = Depends(get_db)):
    consulta = select(Voter).where(Voter.document == document)
    votante = db.scalars(consulta).first()
    
    if votante is None:
        raise HTTPException(
            status_code = 404,
            detail = "Votante no encontrado"
        )

    return votante

# Obtener todos los votantes
@app.get("/voters", response_model=list[VotersResponse])
def get_voters(db: Session = Depends(get_db)):
    consulta = select(Voter)
    votantes = db.scalars(consulta).all()

    return votantes

# Obtener todos los votos
@app.get("/votes", response_model=list[VoteListResponse])
def get_votes(db: Session = Depends(get_db)):
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
@app.get("/votes/{id}", response_model=VoteDetailResponse)
def get_vote(id: int, db: Session = Depends(get_db)):
    # Uso alias para poder hacer join de la misma tabla Voter dos veces, una para el votante y otra para el candidato
    Votante = aliased(Voter)
    Candidato = aliased(Voter)

    consulta = (select(Vote.id, Votante.name.label("voter_name"), Votante.last_name.label("voter_last_name"), 
                        Votante.document.label("voter_document"), Votante.dob.label("voter_dob"), Votante.address.label("voter_address"), 
                        Votante.telephone_number.label("voter_telephone_number"), Votante.sex.label("voter_sex"),
                        Candidato.name.label("candidate_name"), Candidato.last_name.label("candidate_last_name"),
                        Vote.voted_at)
                    .join(Votante, Vote.voter_id == Votante.id)
                    .join(Candidato, Vote.candidate_id == Candidato.id).where(Vote.id == id).first())
    voto = db.execute(consulta).mappings().first()

    if voto is None:
        raise HTTPException(
            status_code = 404,
            detail = "Voto no encontrado"
        )

    return voto

# Crear un voto
@app.post("/votes", response_model=VoteResponse, status_code=201)
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

# Obtener candidatos mas votados (top 5)
@app.get("/candidates/most-voted", response_model=list[RankingResponse])
def get_most_voted_candidates(db: Session = Depends(get_db)):
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

@app.post("/voter, response_model=VotersResponse, status_code=201)")
def create_voter(datos: VoterCreate, db: Session = Depends(get_db)):
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