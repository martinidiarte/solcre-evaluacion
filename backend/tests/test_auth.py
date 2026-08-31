from conftest import client, get_auth_headers

def test_login():
    login_response = client.post(
        "/admin/login",
        json={
            "email": "martinidiarte@example.com",
            "password": "admin123"
        }
    )
    assert login_response.status_code == 200

def test_login_incorrect_password():
    login_response = client.post(
            "/admin/login",
            json={
                "email": "martinidiarte@example.com",
                "password": "admin123"
            }
        )
    assert login_response.status_code == 200

    login_response = client.post(
            "/admin/login",
            json={
                "email": "martinidiarte@example.com",
                "password": "admin321"
            }
        )
    assert login_response.status_code == 401

def test_login_incorrect_email():
    login_response = client.post(
            "/admin/login",
            json={
                "email": "martinidiarte@example.com",
                "password": "admin123"
            }
        )
    assert login_response.status_code == 200

    login_response = client.post(
            "/admin/login",
            json={
                "email": "pepe@example.com",
                "password": "admin123"
            }
        )
    assert login_response.status_code == 401

def test_change_password_without_authentication():
    response = client.post(
        "/admin/change-password",
        json={
            "old_password": "admin123",
            "new_password": "admin456",
            "confirm_new_password": "admin456"
        }
    )

    assert response.status_code == 401

def test_change_password_wrong_old_password():
    headers = get_auth_headers(client)

    response = client.post(
        "/admin/change-password",
        headers=headers,
        json={
            "old_password": "clave_incorrecta",
            "new_password": "admin456",
            "confirm_new_password": "admin456"
        }
    )

    assert response.status_code == 401

def test_change_password_mismatched_confirmation():
    headers = get_auth_headers(client)

    response = client.post(
        "/admin/change-password",
        headers=headers,
        json={
            "old_password": "admin123",
            "new_password": "admin456",
            "confirm_new_password": "otra_clave"
        }
    )

    assert response.status_code == 400

def test_change_password_authenticated():
    headers = get_auth_headers(client)
    temp_password = "admin456"

    response = client.post(
        "/admin/change-password",
        headers=headers,
        json={
            "old_password": "admin123",
            "new_password": temp_password,
            "confirm_new_password": temp_password
        }
    )
    assert response.status_code == 200

    revert_response = client.post(
        "/admin/change-password",
        headers=headers,
        json={
            "old_password": temp_password,
            "new_password": "admin123",
            "confirm_new_password": "admin123"
        }
    )
    assert revert_response.status_code == 200
