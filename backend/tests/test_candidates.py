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

    # La base de datos de tests se limpia antes de cada test (ver clean_test_database
    # en conftest.py), así que podemos usar una cantidad fija de votos.
    votes_needed = 3

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

def test_most_voted_candidates_expected_order():
    headers = get_auth_headers(client)

    first_place = create_test_voter(headers, is_candidate=True, sex="Masculino")
    second_place = create_test_voter(headers, is_candidate=True, sex="Femenino")
    third_place = create_test_voter(headers, is_candidate=True, sex="Otro")

    def vote_n_times(candidate, n):
        for _ in range(n):
            voter = create_test_voter(headers, is_candidate=False, sex="Masculino")
            vote_response = client.post(
                "/votes",
                json={
                    "document": voter["document"],
                    "candidate_id": candidate["id"]
                }
            )
            assert vote_response.status_code == 201

    # Votos estrictamente decrecientes: first_place > second_place > third_place
    vote_n_times(first_place, 3)
    vote_n_times(second_place, 2)
    vote_n_times(third_place, 1)

    response = client.get("/candidates/most-voted", headers=headers)
    assert response.status_code == 200

    ranking = response.json()
    votes_by_id = {c["id"]: c["number_votes"] for c in ranking}

    # Los tres deben aparecer en el ranking, con la cantidad de votos correcta
    assert votes_by_id[first_place["id"]] == 3
    assert votes_by_id[second_place["id"]] == 2
    assert votes_by_id[third_place["id"]] == 1

    # Y en el orden exacto esperado: first_place, luego second_place, luego third_place
    ranking_ids = [c["id"] for c in ranking]
    assert ranking_ids.index(first_place["id"]) < ranking_ids.index(second_place["id"]) < ranking_ids.index(third_place["id"])
