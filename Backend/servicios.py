from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Login import router as login_router
from Usuarios import router as usuario_router  
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='.venv/.env')

app = FastAPI(
    title="Microservicio de Autenticación y Registro",
    description="API para autenticación de usuarios, registro y manejo de datos financieros",
    version="1.0.0"
)

# Configurar CORS
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

# Montamos las rutas
app.include_router(login_router)
app.include_router(usuario_router)  
