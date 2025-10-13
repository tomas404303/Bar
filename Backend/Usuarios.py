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
    except pyodbc.Error as e:
        return "F"
    finally:
        db.close()


@router.get("/{nui}")
def obtener_usuario(nui: str):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query = "SELECT * FROM usuario WHERE nui = ?"
        cursor.execute(query, (nui,))
        result = cursor.fetchone()

        if not result:
            return "F"

        columns = [column[0] for column in cursor.description]
        data = dict(zip(columns, result))
        return data

    except pyodbc.Error as e:
        return "F"

    finally:
        db.close()



@router.put("/actualizar/{nui}")
def actualizar_usuario(nui: str, data: UpdateUsuario):
    db = connect_to_sqlserver()
    cursor = db.cursor()

    try:
        query_check = "SELECT nui FROM usuario WHERE nui = ?"
        cursor.execute(query_check, (nui,))
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

        # Ejecutar actualización
        query_update = f"UPDATE usuario SET {', '.join(fields)} WHERE nui = ?"
        values.append(nui)
        cursor.execute(query_update, tuple(values))
        db.commit()

        return "OK"

    except pyodbc.Error as e:
        return "F"

    finally:
        db.close()


@router.get("/roles/listar")
def listar_roles():
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query = "SELECT id, nombreRol FROM rol"
        cursor.execute(query)
        rows = cursor.fetchall()
        if not rows:
            return "F"
        return [{"id": r[0], "nombreRol": r[1]} for r in rows]
    except pyodbc.Error as e:
        return "F"
    finally:
        db.close()


@router.get("/documentos/listar")
def listar_tipos_documento():
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query = "SELECT id, nombreTipoDocumento FROM tDocumento"
        cursor.execute(query)
        rows = cursor.fetchall()
        if not rows:
            return "F"
        return [{"id": r[0], "nombreTipoDocumento": r[1]} for r in rows]
    except pyodbc.Error as e:
        return "F"
    finally:
        db.close()


@router.get("/")
def listar_usuarios():
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query = """
            SELECT id, nui, nombres_apellidos, usuario, cargoDesempeña, sedeOpera, estadoUsuario
            FROM usuario
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        if not rows:
            return "F"
        return [
            {
                "id": r[0],
                "nui": r[1],
                "nombres_apellidos": r[2],
                "usuario": r[3],
                "cargoDesempeña": r[4],
                "sedeOpera": r[5],
                "estadoUsuario": r[6]
            } for r in rows
        ]
    except pyodbc.Error as e:
        return "F"
    finally:
        db.close()
