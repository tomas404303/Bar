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
    query = """
    SELECT u.contraseña, u.estadoUsuario, s.nombre, u.usuario, r.cargo FROM usuario u 
    INNER JOIN roles r ON u.cargoDesempeña = r.id
    INNER JOIN sucursales s ON u.sedeOpera = s.id 
    WHERE usuario = ?"""
    result = execute_query(query, [request.Usuario])
    #SELECT contraseña, estadoUsuario, cargoDesempeña, sedeOpera FROM usuario WHERE usuario = ?
    if result:
        contrasena_db, estado, sede, usuario, cargo = result[0]
        if bcrypt.checkpw(request.Contrasena.encode("utf-8"), contrasena_db.strip().encode("utf-8")):
            if estado == 0:
                return {"status": "F", "reason": "Usuario inactivo"}
            return {"status": "OK", "cargo": {cargo}, "sede": {sede},
                    "usuario": {usuario}}
        else:
            return {"status": "F", "reason": "Contraseña incorrecta"}
    else:
        return {"status": "F", "reason": "Usuario no encontrado"}
