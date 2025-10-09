from fastapi import APIRouter
from pydantic import BaseModel
from Database import connect_to_sqlserver, execute_query, fetch_one
from Security import encriptar_contraseña
import pyodbc

router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"]
)

class UsuarioBase(BaseModel):
    nui: str
    tipoDocumento: int
    nombresApellidos: str
    estadoUsuario: int
    cargoDesempeña: int
    sedeOpera: int
    usuario: str
    contraseña: str

class UpdateUsuario(BaseModel):
    estadoUsuario: int | None = None
    cargoDesempeña: int | None = None
    sedeOpera: int | None = None
    nuevaContraseña: str | None = None
    confirmarContraseña: str | None = None



@router.post("/")
def crear_usuario(data: UsuarioBase):
    db = connect_to_sqlserver()
    hashed = encriptar_contraseña(data.contraseña)

    query = """
        INSERT INTO usuario (nui, tipoDocumento, nombres_apellidos, estadoUsuario,
        cargoDesempeña, sedeOpera, usuario, contraseña)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """

    try:
        execute_query(db, query, (
            data.nui, data.tipoDocumento, data.nombresApellidos,
            data.estadoUsuario, data.cargoDesempeña, data.sedeOpera,
            data.usuario, hashed
        ))
        return "OK"
    except pyodbc.Error:
        return "F"
    finally:
        db.close()


@router.get("/{id}")
def obtener_usuario(id: int):
    db = connect_to_sqlserver()
    query = "SELECT * FROM usuario WHERE id = ?"
    result = fetch_one(db, query, (id,))

    if not result:
        db.close()
        return "F"

    cursor = db.cursor()
    cursor.execute(query, (id,))
    columns = [column[0] for column in cursor.description]
    cursor.close()

    data = dict(zip(columns, result))
    db.close()

    return data  



@router.put("/{id}")
def actualizar_usuario(id: int, data: UpdateUsuario):
    db = connect_to_sqlserver()
    cursor = db.cursor()

    query_check = "SELECT id FROM usuario WHERE id = ?"
    cursor.execute(query_check, (id,))
    if not cursor.fetchone():
        db.close()
        return "F"

    fields = []
    values = []

    if data.estadoUsuario is not None:
        fields.append("estadoUsuario = ?")
        values.append(data.estadoUsuario)

    if data.cargoDesempeña is not None:
        fields.append("cargoDesempeña = ?")
        values.append(data.cargoDesempeña)

    if data.sedeOpera is not None:
        fields.append("sedeOpera = ?")
        values.append(data.sedeOpera)

    if data.nuevaContraseña and data.confirmarContraseña:
        if data.nuevaContraseña == data.confirmarContraseña:
            hashed = encriptar_contraseña(data.nuevaContraseña)
            fields.append("contraseña = ?")
            values.append(hashed)
        else:
            db.close()
            return "F"

    if not fields:
        db.close()
        return "F"

    query_update = f"UPDATE usuario SET {', '.join(fields)} WHERE id = ?"
    values.append(id)

    try:
        cursor.execute(query_update, tuple(values))
        db.commit()
        return "OK"
    except pyodbc.Error:
        return "F"
    finally:
        db.close()
