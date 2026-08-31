import os
import sys
import uuid
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, delete, select, text
from sqlalchemy.orm import sessionmaker

from main import app
from db.connection import Base, get_db
from db import models 
from db.models import Admin, Vote, Voter
from security.security import hash_password

MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_PORT = os.getenv("MYSQL_PORT")
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_ROOT_PASSWORD = os.getenv("MYSQL_ROOT_PASSWORD")

TEST_DATABASE = "solcre_test"

# MYSQL_USER solo tiene privilegios sobre la base de desarrollo (MYSQL_DATABASE),
# así que para crear la base de tests y darle acceso nos conectamos como root,
# sin apuntar a ninguna base en particular.
root_engine = create_engine(
    f"mysql+pymysql://root:{MYSQL_ROOT_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/"
)
with root_engine.begin() as connection:
    connection.execute(text(f"CREATE DATABASE IF NOT EXISTS {TEST_DATABASE}"))
    connection.execute(text(f"GRANT ALL PRIVILEGES ON {TEST_DATABASE}.* TO '{MYSQL_USER}'@'%'"))
    connection.execute(text("FLUSH PRIVILEGES"))
root_engine.dispose()

# Engine de tests: mismas credenciales de la app, apuntando a la base aislada solcre_test
test_engine = create_engine(
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{TEST_DATABASE}"
)
TestingSessionLocal = sessionmaker(bind=test_engine)

Base.metadata.create_all(test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Crea el admin necesario para los tests si todavía no existe
with TestingSessionLocal() as db:
    admin_existente = db.scalars(
        select(Admin).where(Admin.email == "martinidiarte@example.com")
    ).first()

    if admin_existente is None:
        db.add(Admin(
            name="Martin",
            last_name="Idiarte",
            email="martinidiarte@example.com",
            password_hash=hash_password("admin123")
        ))
        db.commit()

@pytest.fixture(autouse=True)
def clean_test_database():
    # Se ejecuta antes de cada test
    # Vacía votes y voters en ese orden, por la foreign key para que cada test
    with TestingSessionLocal() as db:
        db.execute(delete(Vote))
        db.execute(delete(Voter))
        db.commit()

client = TestClient(app)

def get_auth_headers(client):
    response = client.post(
        "/admin/login",
        json={
            "email": "martinidiarte@example.com",
            "password": "admin123"
        }
    )

    assert response.status_code == 200, response.json()

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }

def unique_document():
    return f"TEST{uuid.uuid4().hex[:10]}"

def base_voter_payload():
    return {
        "name": "Juan",
        "last_name": "Perez",
        "document": unique_document(),
        "dob": "1990-01-01",
        "is_candidate": False,
        "address": "Calle Falsa 123",
        "telephone_number": "1122334455",
        "sex": "Masculino"
    }

def create_test_voter(headers, is_candidate=False, sex="Masculino"):
    document = unique_document()

    response = client.post(
        "/voter",
        headers=headers,
        json={
            "name": "Juan",
            "last_name": "Perez",
            "document": document,
            "dob": "1990-01-01",
            "is_candidate": is_candidate,
            "address": "Calle Falsa 123",
            "telephone_number": "1122334455",
            "sex": sex
        }
    )
    assert response.status_code == 201, response.json()

    return response.json()
