import sys
import uuid
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from main import app

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
