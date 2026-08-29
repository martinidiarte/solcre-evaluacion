FROM python:3.14-slim

#Directorio de trabajo dentro del contenedor
WORKDIR /app

#Copiar las dependencias
COPY requirements.txt .

#Instalar las dependencias
RUN pip install --no-cache-dir -r requirements.txt

#Copiar el resto del código de la aplicación
COPY . .

#Cuando arranque el contenedor, ejecutar el comando para iniciar la aplicación FastAPI
CMD ["fastapi", "run", "main.py", "--port", "8000"]