from conftest import client, get_auth_headers, create_test_voter

def test_get_candidates():
    response = client.get('/candidates')

    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_candidates_only_returns_candidates():
    headers = get_auth_headers(client)
    candidate = create_test_voter(headers, is_candidate=True, sex="Masculino")
    non_candidate = create_test_voter(headers, is_candidate=False, sex="Femenino")

    response = client.get('/candidates')

    assert response.status_code == 200
    candidate_ids = [c["id"] for c in response.json()]

    assert candidate["id"] in candidate_ids
    assert non_candidate["id"] not in candidate_ids

def test_get_most_voted_candidates_authenticated():
    headers = get_auth_headers(client)

    response = client.get("/candidates/most-voted", headers=headers)

    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_most_voted_candidates_ranking_order():
    headers = get_auth_headers(client)

    # La base de datos es real y persiste entre corridas, así que en vez de asumir
    # un número fijo de votos, calculamos cuántos hacen falta para superar el
    # máximo actual y así garantizar que nuestro candidato quede primero sin
    # depender de datos acumulados de ejecuciones anteriores.
    current_ranking = client.get("/candidates/most-voted", headers=headers).json()
    current_max_votes = max((c["number_votes"] for c in current_ranking), default=0)
    votes_needed = current_max_votes + 1

    top_candidate = create_test_voter(headers, is_candidate=True, sex="Masculino")
    voters = [create_test_voter(headers, is_candidate=False, sex="Femenino") for _ in range(votes_needed)]

    for voter in voters:
        vote_response = client.post(
            "/votes",
            json={
                "document": voter["document"],
                "candidate_id": top_candidate["id"]
            }
        )
        assert vote_response.status_code == 201

    response = client.get("/candidates/most-voted", headers=headers)
    assert response.status_code == 200

    ranking = response.json()
    votes_counts = [c["number_votes"] for c in ranking]

    # El ranking completo debe estar ordenado de mayor a menor cantidad de votos
    assert votes_counts == sorted(votes_counts, reverse=True)

    # El candidato que acabamos de crear tiene ahora el máximo estricto, debe quedar primero
    assert ranking[0]["id"] == top_candidate["id"]
    assert ranking[0]["number_votes"] == votes_needed
