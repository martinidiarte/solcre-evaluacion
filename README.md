# Solcre - Sistema de Votación

Sistema de votación con backend en FastAPI (MySQL + SQLAlchemy) y frontend en React (Vite).

## Estructura del proyecto

- [backend/](backend/) — API REST (FastAPI + SQLAlchemy + MySQL, migraciones con Alembic)
- [frontend/](frontend/) — SPA (React + Vite)

## Requisitos previos

- Docker y Docker Compose (para el backend y la base de datos)
- Node.js 20.19+ y npm (para el frontend, que corre fuera de Docker)

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

`MYSQL_HOST` debe ser `db` (el nombre del servicio en [compose.yml](compose.yml)) y `MYSQL_PORT` `3306`. `MYSQL_ROOT_PASSWORD` se utiliza para tareas administrativas de MySQL, como inicializar la base de datos y crear la base aislada utilizada por los tests.

## 2. Levantar el backend y la base de datos

```
docker compose up -d --build
```

Esto levanta dos contenedores:

- `solcre-backend`: API FastAPI en http://localhost:8000 (docs interactivas en http://localhost:8000/docs)
- `solcre-db`: MySQL 8.4 en `localhost:3306`

## 3. Crear el esquema de la base de datos

El contenedor de MySQL arranca con la base vacía. Elegir una de estas dos opciones:

### Opción A — `backend/db/schema.sql` (recomendada)

Crea las tablas y carga los datos iniciales necesarios para probar la aplicación:

- 1 administrador.
- 10 votantes.
- 8 votantes comunes.
- 2 candidatos.

En PowerShell:

```
docker cp .\backend\db\schema.sql solcre-db:/tmp/schema.sql
docker compose exec db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < /tmp/schema.sql'
```

### Credenciales de prueba

El archivo `backend/db/schema.sql` crea un administrador de prueba con las siguientes credenciales:

```
Email: martinidiarte@example.com
Contraseña: admin123
```

Estas credenciales están destinadas únicamente al entorno local de evaluación. La contraseña se almacena en la base de datos mediante un hash Argon2.

### Opción B — Alembic

Aplica las migraciones para crear la estructura de la base de datos:

```
docker compose exec backend alembic upgrade head
```
Esta opción crea únicamente la estructura de la base de datos y no carga los datos iniciales definidos en `schema.sql`.

## 4. Levantar el frontend

```
cd frontend
npm install
npm run dev
```

Corre en http://localhost:5173. El backend tiene CORS habilitado específicamente para ese origen ([backend/main.py](backend/main.py)), y el frontend se comunica con la API disponible en `http://localhost:8000`, por lo que no requiere variables de entorno adicionales para ejecutarse localmente.

## Tests

El backend usa una base de datos de test separada (`solcre_test`), que se crea sola y se limpia antes de cada test (ver [backend/tests/conftest.py](backend/tests/conftest.py)):

```
docker compose exec backend python -m pytest tests/ -v
```

# Colección de Postman

El proyecto incluye una colección de Postman para facilitar la prueba manual de los endpoints de la API.

La colección se encuentra en:

```
postman/Solcre.postman_collection.json
```
Uso
1. Abrir Postman.
2. Seleccionar Import.
3. Importar el archivo postman/Solcre.postman_collection.json.
4. Verificar que el backend esté ejecutándose en http://localhost:8000.
5. Ejecutar primero Autenticacion > Iniciar sesion.

Al iniciar sesión correctamente, la colección guarda automáticamente el token JWT en la variable access_token. Las solicitudes administrativas utilizan este token automáticamente para autenticarse.

La colección permite probar:
- Inicio de sesión del administrador.
- Listado y consulta de votantes.
- Alta de nuevos votantes.
- Listado de candidatos.
- Registro de votos.
- Listado y detalle de votos.
- Ranking de candidatos.
- Cambio de contraseña del administrador.

La colección utiliza los datos de prueba definidos en backend/db/schema.sql. Para obtener un estado inicial conocido antes de realizar las pruebas, se recomienda cargar previamente dicho archivo siguiendo las instrucciones de la sección Crear el esquema de la base de datos.

Algunas solicitudes modifican el estado de la base de datos. Por ejemplo, cada votante puede votar una única vez y la solicitud de cambio de contraseña modifica la contraseña del administrador.