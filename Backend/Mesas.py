from fastapi import APIRouter
from pydantic import BaseModel
from Database import connect_to_sqlserver, execute_query
import pyodbc

router = APIRouter(
    prefix="/mesas",
    tags=["mesas"]
)

class CrearMesas(BaseModel):
    sede: int
    cantidad: int

@router.get("/sedes")
def listar_sedes():
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query = "SELECT * FROM sucursales"
        cursor.execute(query)
        rows = cursor.fetchall()

        if not rows:
            return "F"

        resultado = [{"id": r[0], "nombreSucursal": r[1]} for r in rows]
        return resultado

    except pyodbc.Error as e:
        print("Error al listar sedes:", e)
        return "F"
    finally:
        db.close()




@router.post("/")
def crear_mesas(data: CrearMesas):
    db = connect_to_sqlserver()
    cursor = db.cursor()

    try:
        query_insert = "INSERT INTO mesa (cantidad, sucursales) VALUES (?, ?)"
        cursor.execute(query_insert, (data.cantidad, data.sede))

        db.commit()
        return "OK"

    except pyodbc.Error as e:
        print(" Error creando mesas:", e)
        return "F"
    finally:
        db.close()