# Solcre - Sistema de Votación

Sistema de votación con backend en FastAPI (MySQL + SQLAlchemy) y frontend en React (Vite).

## Estructura del proyecto

- [backend/](backend/) — API REST (FastAPI + SQLAlchemy + MySQL, migraciones con Alembic)
- [frontend/](frontend/) — SPA (React + Vite)

## Requisitos previos

- Git
- Docker y Docker Compose (para el backend y la base de datos)
- Node.js 20.19+ y npm (para el frontend, que corre fuera de Docker)

## Descargar el proyecto

```powershell
git clone https://github.com/martinidiarte/solcre-evaluacion.git
cd solcre-evaluacion
```

## 1. Variables de entorno

Copiar [.env.example](.env.example) a `.env` en la raíz del proyecto:

```powershell
Copy-Item .env.example .env
```

Completar el archivo con valores locales. Por ejemplo:

```env
MYSQL_ROOT_PASSWORD=root_password_local
MYSQL_DATABASE=solcre
MYSQL_USER=solcre_user
MYSQL_PASSWORD=solcre_password_local
MYSQL_HOST=db
MYSQL_PORT=3306
JWT_SECRET_KEY=cambiar-por-una-clave-de-al-menos-32-bytes
```

`MYSQL_HOST` debe ser `db` (el nombre del servicio en [compose.yml](compose.yml)) y `MYSQL_PORT` debe ser `3306`. `MYSQL_ROOT_PASSWORD` se utiliza para tareas administrativas de MySQL, como inicializar la base de datos y crear la base aislada utilizada por los tests. Para HS256, `JWT_SECRET_KEY` debe tener como mínimo 32 bytes.

## 2. Levantar el backend y la base de datos

```
docker compose up -d --build
```

Esto levanta dos contenedores:

- `solcre-backend`: API FastAPI en http://localhost:8000 (docs interactivas en http://localhost:8000/docs)
- `solcre-db`: MySQL 8.4 en `localhost:3306`

Comprobar el estado de los servicios:

```powershell
docker compose ps
```

Antes de crear el esquema, se puede comprobar que MySQL muestre `ready for connections`:

```powershell
docker compose logs -f db
```

Presionar `Ctrl+C` para dejar de seguir los logs; los contenedores continuarán ejecutándose.

## 3. Crear el esquema de la base de datos

El contenedor de MySQL arranca con la base vacía. Elegir una de estas dos opciones:

### Opción A — `backend/db/schema.sql` (recomendada)

Crea las tablas y carga los datos iniciales necesarios para probar la aplicación:

- 1 administrador.
- 10 votantes.
- 8 votantes comunes.
- 2 candidatos.

> **Advertencia:** este script elimina y vuelve a crear las tablas. Se debe utilizar únicamente para inicializar o restablecer el entorno local de evaluación.

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

Para probar una votación desde el frontend se puede utilizar este votante precargado:

```text
Documento: 48392017
```

### Opción B — Alembic

Aplica las migraciones para crear la estructura de la base de datos:

```
docker compose exec backend alembic upgrade head
```
Esta opción crea únicamente la estructura de la base de datos y no carga los datos iniciales definidos en `schema.sql`.

## 4. Levantar el frontend

```powershell
cd frontend
npm ci
npm run dev
```

En Windows, si PowerShell bloquea `npm.ps1`, utilizar `npm.cmd ci` y `npm.cmd run dev`.

El frontend queda disponible en:

- Inicio: http://localhost:5173
- Votación: http://localhost:5173/votar
- Administración: http://localhost:5173/admin/login

El backend tiene CORS habilitado específicamente para ese origen ([backend/main.py](backend/main.py)), y el frontend se comunica con la API disponible en `http://localhost:8000`, por lo que no requiere variables de entorno adicionales para ejecutarse localmente.

## 5. Levantar la API

El punto 2 ya deja la API levantada. Desde la raíz del proyecto también se pueden iniciar únicamente la base de datos y el backend con:

```
docker compose up -d --build db backend
```

Para verificar que la API inició correctamente, consultar los logs del backend:

```
docker compose logs -f backend
```

Cuando aparezca `Application startup complete`, presionar `Ctrl+C` para dejar de seguir los logs.

La API queda disponible en:

- API: http://localhost:8000
- Documentación interactiva (Swagger): http://localhost:8000/docs
- Documentación alternativa (ReDoc): http://localhost:8000/redoc

El listado administrativo de votos se pagina desde la API. Acepta `page` desde 1 y `page_size` entre 1 y 100; por defecto devuelve 15 votos ordenados del más reciente al más antiguo:

```text
GET http://localhost:8000/votes?page=1&page_size=15
```

## 6. Ejecutar los tests

El backend usa una base de datos de test separada (`solcre_test`), que se crea automáticamente y se limpia antes de cada test (ver [backend/tests/conftest.py](backend/tests/conftest.py)):

```powershell
docker compose exec backend python -m pytest tests/ -v
```

Para ejecutar los tests con cobertura:

```powershell
docker compose exec backend python -m pytest tests/ -q --cov=db --cov=routers --cov=schemas --cov=security --cov=main --cov-report=term-missing
```

Para validar el frontend:

```powershell
cd frontend
npm run build
npm run lint
```

## 7. Detener o reiniciar el proyecto

Para detener los contenedores conservando los datos de MySQL:

```powershell
docker compose down
```

Para eliminar también el volumen y todos los datos locales de MySQL:

```powershell
docker compose down -v
```

> **Advertencia:** `docker compose down -v` elimina la base de datos local y no se puede deshacer. Después será necesario repetir el punto 3.

## 8. Colección de Postman

El proyecto incluye una colección de Postman para facilitar la prueba manual de los endpoints de la API.

La colección se encuentra en:

```text
postman/Solcre.postman_collection.json
```

### Uso

1. Abrir Postman.
2. Seleccionar Import.
3. Importar el archivo `postman/Solcre.postman_collection.json`.
4. Verificar que el backend esté ejecutándose en http://localhost:8000.
5. Ejecutar primero `Autenticacion > Iniciar sesion`.

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

La colección está ordenada para ejecutarse completa con Collection Runner: obtiene un candidato existente, crea un votante con documento único, registra su voto y reutiliza los identificadores generados en las consultas posteriores. La prueba de cambio de contraseña restaura automáticamente la contraseña original al finalizar. Cada ejecución conserva en la base el votante y el voto creados.

## 9. Generar datos para pruebas de rendimiento

El script [backend/scripts/generate_stress_data.py](backend/scripts/generate_stress_data.py) agrega datos masivos sin eliminar los registros existentes. Por defecto crea 100.000 votantes, de los cuales 500 son candidatos, y registra 80.000 votos:

```powershell
docker compose exec backend python scripts/generate_stress_data.py --yes
```

El volumen y el tamaño de los lotes son configurables. Por ejemplo:

```powershell
docker compose exec backend python scripts/generate_stress_data.py --voters 500000 --candidates 1000 --votes 450000 --batch-size 10000 --yes
```

Cada ejecución usa documentos únicos y conserva los datos anteriores. Para ver todas las opciones:

```powershell
docker compose exec backend python scripts/generate_stress_data.py --help
```

> **Advertencia:** Ejecutar únicamente en un entorno local o de pruebas. Para eliminar todos los datos generados junto con la base local se puede usar `docker compose down -v`, tal como se explica en el punto 7.
