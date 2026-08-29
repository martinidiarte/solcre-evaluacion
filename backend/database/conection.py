from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy import text
import os

#Obtengo las variables de entorno para la conexión a la base de datos MySQL
host = os.getenv("MYSQL_HOST")
user = os.getenv("MYSQL_USER")
password = os.getenv("MYSQL_PASSWORD")
database = os.getenv("MYSQL_DATABASE")
port = int(os.getenv("MYSQL_PORT"))

#El formato que espera SQLAlchemy con PyMySQL es, conceptualmente:
# mysql+pymysql://USUARIO:CONTRASEÑA@HOST:PUERTO/BASE_DE_DATOS

#Idea inicial, pero no es la forma más robusta de construir la URL de conexión
#database_url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"

#Mas robusto
database_url = URL.create(
    drivername="mysql+pymysql",
    username=user,
    password=password,
    host=host,
    port=port,
    database=database
)

#Creo el motor de SQLAlchemy para conectarme a la base de datos MySQL
engine = create_engine(database_url, echo=True)  # echo=True para ver las consultas SQL en la consola   

