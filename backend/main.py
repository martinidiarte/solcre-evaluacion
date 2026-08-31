from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.votes import router as votes_router
from routers.voters import router as voters_router
from routers.admins import router as admins_router


app = FastAPI()

app.include_router(votes_router)
app.include_router(voters_router)
app.include_router(admins_router)

#Esto permite que el frontend de React, que corre en:
#http://localhost:5173
#pueda hacer peticiones al backend en:
#http://localhost:8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
