from fastapi import APIRouter
from pydantic import BaseModel
from Database import connect_to_sqlserver
import pyodbc

router = APIRouter(
    prefix="/sedes",
    tags=["sedes"]
)


class CrearSede(BaseModel):
    nombre: str
    direccion: str
    estado: int


class ActualizarEstadoSede(BaseModel):
    estado: int



@router.post("/")
def crear_sede(data: CrearSede):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query = """
            INSERT INTO sucursales (nombre, direccion, estado)
            VALUES (?, ?, ?)
        """
        cursor.execute(query, (data.nombre, data.direccion, data.estado))
        db.commit()
        return "OK"
    except pyodbc.Error as e:
        print("❌ Error creando sede:", e)
        return "F"
    finally:
        db.close()


@router.get("/")
def listar_sedes():
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query = """
            SELECT id, nombre, direccion, estado
            FROM sucursales
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        if not rows:
            return "F"

        resultado = [
            {"id": r[0], "nombre": r[1], "direccion": r[2], "estado": r[3]}
            for r in rows
        ]
        return resultado

    except pyodbc.Error as e:
        return "F"
    finally:
        db.close()



@router.put("/{id}")
def actualizar_estado_sede(nombre: str, data: ActualizarEstadoSede):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query_check = "SELECT nombre FROM sucursales WHERE nombre = ?"
        cursor.execute(query_check, (nombre,))
        if not cursor.fetchone():
            return "F"

        query_update = "UPDATE sucursales SET estado = ? WHERE nombre = ?"
        cursor.execute(query_update, (data.estado, nombre))
        db.commit()

        return "OK"

    except pyodbc.Error as e:
        return "F"
    finally:
        db.close()
