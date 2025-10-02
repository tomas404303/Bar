from fastapi import APIRouter
from pydantic import BaseModel
from Database import execute_query
import bcrypt

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

class LoginRequest(BaseModel):
    Usuario: str
    Contrasena: str

@router.post("/login")
async def login(request: LoginRequest):
    query = "SELECT contraseña FROM usuario WHERE usuario = ?"
    result = execute_query(query, [request.Usuario])



    if result:
        contrasena_db = result[0][0] 
        if bcrypt.checkpw(request.Contrasena.encode("utf-8"), contrasena_db.strip().encode("utf-8")):
            return {"status": "OK"}
        else:
            return {"status": "F", "reason": "Contraseña incorrecta"}
    else:
        return {"status": "F", "reason": "Usuario no encontrado"}
