from sqlalchemy import (
    Integer,
    String,
    Date,
    DateTime,
    Boolean,
    Enum,
    ForeignKey,
    Index,
    func,
    text,
)
from sqlalchemy.orm import mapped_column
from .connection import Base

class Admin(Base):
    __tablename__ = "admins"
    id = mapped_column(Integer, primary_key=True)
    name = mapped_column(String(255), nullable=False)
    last_name = mapped_column(String(255), nullable=False)
    email = mapped_column(String(255), unique=True, nullable=False)
    password_hash = mapped_column(String(255), nullable=False)
    # Para tomar la fecha de creación del registro, se utiliza la función current_timestamp() 
    # de SQLAlchemy para establecer el valor predeterminado de la columna created_at como la 
    # fecha y hora actual en el momento de la inserción del registro
    created_at = mapped_column(DateTime, nullable=False, server_default=func.current_timestamp()
    )

class Voter(Base):
    __tablename__ = "voters"
    id = mapped_column(Integer, primary_key=True)
    name = mapped_column(String(255), nullable=False)
    last_name = mapped_column(String(255), nullable=False)
    document = mapped_column(String(20), unique=True, nullable=False)
    dob = mapped_column(Date, nullable=False)
    is_candidate = mapped_column(Boolean, nullable=False, server_default=text("0"))
    address = mapped_column(String(255), nullable=False)
    telephone_number = mapped_column(String(20), nullable=False)
    sex = mapped_column(Enum('Masculino', 'Femenino', 'Otro'), nullable=False)
    created_at = mapped_column(DateTime, nullable=False, server_default=func.current_timestamp())


class Vote(Base):
    __tablename__ = "votes"
    id = mapped_column(Integer, primary_key=True)
    voter_id = mapped_column(Integer, ForeignKey("voters.id"), unique=True, nullable=False)
    candidate_id = mapped_column(Integer, ForeignKey("voters.id"), nullable=False)
    voted_at = mapped_column(DateTime, nullable=False, server_default=func.current_timestamp())
    # Se agrega un índice para optimizar la búsqueda de votos por candidato 
    __table_args__ = (
        Index('idx_votes_candidate_id', 'candidate_id'),
    )