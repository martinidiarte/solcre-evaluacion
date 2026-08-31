# Solcre - Sistema de Votación

Sistema de votación con backend en FastAPI (MySQL + SQLAlchemy) y frontend en React (Vite).

## Estructura del proyecto

- [backend/](backend/) — API REST (FastAPI + SQLAlchemy + MySQL, migraciones con Alembic)
- [frontend/](frontend/) — SPA (React + Vite)

## Requisitos previos

- Docker y Docker Compose (para el backend y la base de datos)
- Node.js 18+ y npm (para el frontend, que corre fuera de Docker)

## 1. Variables de entorno

Copiar [.env.example](.env.example) a `.env` en la raíz del proyecto y completar los valores:

```
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_HOST=db
MYSQL_PORT=3306
JWT_SECRET_KEY=
```

`MYSQL_HOST` debe ser `db` (el nombre del servicio en [compose.yml](compose.yml)) y `MYSQL_PORT` `3306`. `MYSQL_ROOT_PASSWORD` solo la usan los tests, para crear la base `solcre_test` y darle permisos a `MYSQL_USER`.

## 2. Levantar el backend y la base de datos

```
docker compose up -d --build
```

Esto levanta dos contenedores:

- `solcre-backend`: API FastAPI en http://localhost:8000 (docs interactivas en http://localhost:8000/docs)
- `solcre-db`: MySQL 8.4 en `localhost:3306`

## 3. Crear el esquema de la base de datos

El contenedor de MySQL arranca con la base vacía. Elegir una de estas dos opciones:

**Opción A — [backend/db/schema.sql](backend/db/schema.sql):** crea las tablas y carga datos de ejemplo (un admin y varios voters/candidates).

```
docker compose exec -T db mysql -uroot -p<MYSQL_ROOT_PASSWORD> <MYSQL_DATABASE> < backend/db/schema.sql
```

En PowerShell:

```
Get-Content backend/db/schema.sql | docker compose exec -T db mysql -uroot -p<MYSQL_ROOT_PASSWORD> <MYSQL_DATABASE>
```

El hash de contraseña del admin sembrado en ese script no está documentado en el repo. Si no conocés la contraseña en texto plano, generá un hash nuevo y actualizalo:

```
docker compose exec backend python -c "from security.security import hash_password; print(hash_password('tu_password'))"
```

y actualizá el `password_hash` del admin (por email) directo en la base.

**Opción B — Alembic:** aplica las migraciones (solo esquema, sin datos de ejemplo).

```
docker compose exec backend alembic upgrade head
```

Con esta opción hay que crear el admin manualmente (mismo snippet de `hash_password` de arriba, insertado en la tabla `admins`).

## 4. Levantar el frontend

```
cd frontend
npm install
npm run dev
```

Corre en http://localhost:5173. El backend tiene CORS habilitado específicamente para ese origen ([backend/main.py](backend/main.py)), y el frontend apunta a `http://localhost:8000` de forma hardcodeada, así que no requiere variables de entorno propias.

## Tests

El backend usa una base de datos de test separada (`solcre_test`), que se crea sola y se limpia antes de cada test (ver [backend/tests/conftest.py](backend/tests/conftest.py)):

```
docker compose exec backend python -m pytest tests/ -v
```
