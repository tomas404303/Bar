from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from Autenticacion.Login import router as login_router
from gestionOperativa.Usuarios import router as usuario_router
from gestionOperativa.Mesas import router as mesas_router
from gestionOperativa.Sedes import router as sedes_router
from gestionOperativa.Sedes import router as productos_router
from gestionOperativa.Inventario import router as inventario_router

load_dotenv(dotenv_path='.venv/.env')

app = FastAPI(
    title="Microservicio de inventarios de un BAR",
    description="API inventarios de un bar",
    version="1.0.0"
)

origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    os.getenv("FRONTEND_URL_2", "http://localhost:5173"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(login_router)
app.include_router(usuario_router)
app.include_router(mesas_router)
app.include_router(sedes_router)
app.include_router(productos_router)
app.include_router(inventario_router)
