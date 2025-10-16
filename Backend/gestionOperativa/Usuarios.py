from fastapi import APIRouter
from pydantic import BaseModel
from Database import connect_to_sqlserver, execute_query, fetch_one
from Autenticacion.Security import encriptar_contraseña
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
    cursor = db.cursor()
    try:
        query_estado = "SELECT estado FROM sucursales WHERE id = ?"
        cursor.execute(query_estado, (data.sedeOpera,))
        result_estado = cursor.fetchone()

        if not result_estado:
            return {"status": "F", "reason": "Sede no encontrada"}

        if result_estado[0] == 0:
            return {"status": "F", "reason": "No se puede crear usuario en una sede inactiva"}

        from Autenticacion.Security import encriptar_contraseña
        from Database import execute_query
        hashed = encriptar_contraseña(data.contraseña)

        query = """
            INSERT INTO usuario (nui, tipoDocumento, nombres_apellidos, estadoUsuario,
            cargoDesempeña, sedeOpera, usuario, contraseña)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """

        execute_query(db, query, (
            data.nui, data.tipoDocumento, data.nombresApellidos,
            data.estadoUsuario, data.cargoDesempeña, data.sedeOpera,
            data.usuario, hashed
        ))
        return {"status": "OK"}

    except pyodbc.Error as e:
        return {"status": "F", "error": str(e)}

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

        return {"status":"OK"}

    except pyodbc.Error as e:
        return "F"

    finally:
        db.close()


@router.get("/roles/listar")
def listar_roles():
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query = "SELECT id, cargo FROM roles"
        cursor.execute(query)
        rows = cursor.fetchall()
        if not rows:
            return "F"
        return [{"id": r[0], "cargo": r[1]} for r in rows]
    except pyodbc.Error as e:
        return "F"
    finally:
        db.close()


@router.get("/documentos/listar")
def listar_tipos_documento():
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query = "SELECT id, definicion FROM tDocumento"
        cursor.execute(query)
        rows = cursor.fetchall()
        if not rows:
            return "F"
        return [{"id": r[0], "definicion": r[1]} for r in rows]
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
            SELECT u.id, u.nui, u.nombres_apellidos, u.usuario, r.cargo, s.nombre, u.estadoUsuario, d.abrevicion
            FROM usuario u
            INNER JOIN roles r ON u.cargoDesempeña = r.id
            INNER JOIN sucursales s ON u.sedeOpera = s.id
            INNER JOIN tDocumento d ON u.tipoDocumento = d.id
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
                "estadoUsuario": r[6],
                "tipoDocumento": r[7]
            } for r in rows
            ]
    except pyodbc.Error as e:
        return "F"
    finally:
        db.close()
