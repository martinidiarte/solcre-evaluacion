from datetime import date

from conftest import client, get_auth_headers, unique_document, base_voter_payload, create_test_voter

def test_get_voters_without_authentication():
    response = client.get('/voters')

    assert response.status_code == 401

def test_get_voters_authenticated():
    headers = get_auth_headers(client)

    response = client.get(
        "/voters",
        headers=headers
    )

    assert response.status_code == 200

def test_create_voter_authenticated():
    headers = get_auth_headers(client)
    voter = create_test_voter(headers)

    assert voter["document"].startswith("TEST")

def test_create_voter_duplicate_document():
    headers = get_auth_headers(client)
    document = unique_document()
    payload = {
        "name": "Maria",
        "last_name": "Gomez",
        "document": document,
        "dob": "1990-01-01",
        "is_candidate": False,
        "address": "Calle Falsa 456",
        "telephone_number": "1122334455",
        "sex": "Femenino"
    }

    first_response = client.post("/voter", headers=headers, json=payload)
    assert first_response.status_code == 201

    second_response = client.post("/voter", headers=headers, json=payload)
    assert second_response.status_code == 409

def test_create_voter_without_authentication():
    response = client.post(
        "/voter",
        json={
            "name": "Ana",
            "last_name": "Diaz",
            "document": unique_document(),
            "dob": "1990-01-01",
            "is_candidate": False,
            "address": "Calle Falsa 789",
            "telephone_number": "1122334455",
            "sex": "Otro"
        }
    )
    assert response.status_code == 401

def test_create_voter_future_dob():
    headers = get_auth_headers(client)
    payload = base_voter_payload()
    payload["dob"] = date.today().replace(year=date.today().year + 1).isoformat()

    response = client.post("/voter", headers=headers, json=payload)

    assert response.status_code == 422

def test_create_voter_underage():
    headers = get_auth_headers(client)
    payload = base_voter_payload()
    payload["dob"] = date(date.today().year - 10, 1, 1).isoformat()

    response = client.post("/voter", headers=headers, json=payload)

    assert response.status_code == 422

def test_create_voter_invalid_phone():
    headers = get_auth_headers(client)
    payload = base_voter_payload()
    payload["telephone_number"] = "abcd1234"

    response = client.post("/voter", headers=headers, json=payload)

    assert response.status_code == 422

def test_create_voter_invalid_name():
    headers = get_auth_headers(client)
    payload = base_voter_payload()
    payload["name"] = "Juan123"

    response = client.post("/voter", headers=headers, json=payload)

    assert response.status_code == 422

def test_create_voter_empty_required_field():
    headers = get_auth_headers(client)
    payload = base_voter_payload()
    payload["address"] = ""

    response = client.post("/voter", headers=headers, json=payload)

    assert response.status_code == 422

def test_create_voter_invalid_sex():
    headers = get_auth_headers(client)
    payload = base_voter_payload()
    payload["sex"] = "Invalido"

    response = client.post("/voter", headers=headers, json=payload)

    assert response.status_code == 422

def test_get_voter_by_document_authenticated():
    headers = get_auth_headers(client)
    voter = create_test_voter(headers)

    response = client.get(f"/voters/{voter['document']}", headers=headers)

    assert response.status_code == 200
    assert response.json()["document"] == voter["document"]

def test_get_voter_by_document_not_found():
    headers = get_auth_headers(client)

    response = client.get(f"/voters/{unique_document()}", headers=headers)

    assert response.status_code == 404
