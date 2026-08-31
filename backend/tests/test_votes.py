from conftest import client, get_auth_headers, unique_document, create_test_voter

def test_get_votes_without_authentication():
    response = client.get('/votes')

    assert response.status_code == 401

def test_get_votes_authenticated():
    headers = get_auth_headers(client)

    response = client.get(
        "/votes",
        headers=headers
    )

    assert response.status_code == 200

def test_create_vote_authenticated():
    headers = get_auth_headers(client)
    voter = create_test_voter(headers, is_candidate=False, sex="Masculino")
    candidate = create_test_voter(headers, is_candidate=True, sex="Femenino")

    response = client.post(
        "/votes",
        json={
            "document": voter["document"],
            "candidate_id": candidate["id"]
        }
    )

    assert response.status_code == 201
    assert response.json()["candidate_id"] == candidate["id"]

def test_create_vote_voter_not_found():
    response = client.post(
        "/votes",
        json={
            "document": unique_document(),
            "candidate_id": 1
        }
    )

    assert response.status_code == 404

def test_create_vote_candidate_not_found():
    headers = get_auth_headers(client)
    voter = create_test_voter(headers, is_candidate=False, sex="Masculino")

    response = client.post(
        "/votes",
        json={
            "document": voter["document"],
            "candidate_id": 999999999
        }
    )

    assert response.status_code == 404

def test_create_vote_candidate_is_not_candidate():
    headers = get_auth_headers(client)
    voter = create_test_voter(headers, is_candidate=False, sex="Masculino")
    non_candidate = create_test_voter(headers, is_candidate=False, sex="Femenino")

    response = client.post(
        "/votes",
        json={
            "document": voter["document"],
            "candidate_id": non_candidate["id"]
        }
    )

    assert response.status_code == 404

def test_create_vote_duplicate():
    headers = get_auth_headers(client)
    voter = create_test_voter(headers, is_candidate=False, sex="Masculino")
    candidate = create_test_voter(headers, is_candidate=True, sex="Femenino")

    first_response = client.post(
        "/votes",
        json={
            "document": voter["document"],
            "candidate_id": candidate["id"]
        }
    )
    assert first_response.status_code == 201

    second_response = client.post(
        "/votes",
        json={
            "document": voter["document"],
            "candidate_id": candidate["id"]
        }
    )
    assert second_response.status_code == 409

def test_get_vote_by_id_authenticated():
    headers = get_auth_headers(client)
    voter = create_test_voter(headers, is_candidate=False, sex="Masculino")
    candidate = create_test_voter(headers, is_candidate=True, sex="Femenino")

    vote_response = client.post(
        "/votes",
        json={
            "document": voter["document"],
            "candidate_id": candidate["id"]
        }
    )
    assert vote_response.status_code == 201
    vote_id = vote_response.json()["id"]

    response = client.get(f"/votes/{vote_id}", headers=headers)

    assert response.status_code == 200
    assert response.json()["voter_document"] == voter["document"]

def test_get_vote_by_id_not_found():
    headers = get_auth_headers(client)

    response = client.get("/votes/999999999", headers=headers)

    assert response.status_code == 404
