# Login.py
from fastapi import APIRouter
from pydantic import BaseModel
from Database import execute_query,connect_to_sqlserver
from Security import verificar_contraseña  
from Database import connect_to_sqlserver, fetch_one

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

class LoginRequest(BaseModel):
    Usuario: str
    Contrasena: str


def validar_estado_recursivo(tipo, id_entidad):
    db = connect_to_sqlserver()

    if tipo == "usuario":
        query = "SELECT estadoUsuario, sedeOpera FROM usuario WHERE id = ?"
        result = fetch_one(db, query, [id_entidad])
        db.close()

        if not result:
            return "F"  # devolvemos 'F' como string, no booleano

        estadoUsuario, sedeOpera = result  # quitamos [0]

        if estadoUsuario == 0:
            return "F"

        # 🔁 llamada recursiva: validar la sede
        return validar_estado_recursivo("sede", sedeOpera)

    elif tipo == "sede":
        query = "SELECT estado FROM sucursales WHERE id = ?"
        result = fetch_one(db, query, [id_entidad])
        db.close()

        if not result:
            return "F"

        estado_sede = result[0]
        if estado_sede == 0:
            return "F"
        return "OK"  # ✅ sede activa

    # En caso de tipo no reconocido
    return "F"

@router.post("/login")
async def login(request: LoginRequest):
    query = """
    SELECT u.id, u.contraseña, s.nombre, u.usuario, r.cargo
    FROM usuario u 
    INNER JOIN roles r ON u.cargoDesempeña = r.id
    INNER JOIN sucursales s ON u.sedeOpera = s.id 
    WHERE u.usuario = ?
    """
    db = connect_to_sqlserver()
    cursor = db.cursor()
    cursor.execute(query, [request.Usuario])
    result = cursor.fetchone()
    cursor.close()
    db.close()
    if not result:
        return "Usuario no encontrado"

    id_usuario, contrasena_db, sede, usuario, cargo = result

    if not verificar_contraseña(request.Contrasena, contrasena_db.strip()):
        return "Contraseña incorrecta"

    estado_validacion = validar_estado_recursivo("usuario", id_usuario)
    if estado_validacion != "OK":
        return estado_validacion

    return "OK"
