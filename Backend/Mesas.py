from fastapi import APIRouter
from pydantic import BaseModel
from Database import connect_to_sqlserver
import pyodbc

router = APIRouter(
    prefix="/mesas",
    tags=["mesas"]
)

class CrearMesas(BaseModel):
    sede: int
    cantidad: int

class ActualizarMesas(BaseModel):
    sede: int
    numero: int



@router.get("/sedes")
def listar_sedes():
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query = "SELECT id, nombreSucursal FROM sucursales"
        cursor.execute(query)
        rows = cursor.fetchall()

        if not rows:
            return "F"

        resultado = [{"id": r[0], "nombreSucursal": r[1]} for r in rows]
        return resultado

    except pyodbc.Error as e:
        return "F"

    finally:
        db.close()



@router.post("/")
def crear_mesas(data: CrearMesas):
    db = connect_to_sqlserver()
    cursor = db.cursor()

    try:
        query_select = "SELECT cantidad FROM mesa WHERE sucursales = ?"
        cursor.execute(query_select, (data.sede,))
        result = cursor.fetchone()

        if result:
            cantidad_actual = result[0] or 0
            nueva_cantidad = cantidad_actual + data.cantidad

            query_update = "UPDATE mesa SET cantidad = ? WHERE sucursales = ?"
            cursor.execute(query_update, (nueva_cantidad, data.sede))
            db.commit()
            return "OK"

        else:
            query_insert = "INSERT INTO mesa (cantidad, sucursales) VALUES (?, ?)"
            cursor.execute(query_insert, (data.cantidad, data.sede))
            db.commit()
            return "OK"

    except pyodbc.Error as e:
        return "F"

    finally:
        db.close()


@router.put("/actualizarmesas")
def actualizar_mesas(data: ActualizarMesas):
    db = connect_to_sqlserver()
    cursor = db.cursor()

    try:
        query_select = "SELECT cantidad FROM mesa WHERE sucursales = ?"
        cursor.execute(query_select, (data.sede,))
        result = cursor.fetchone()

        if not result:
            return "F"

        cantidad_actual = result[0] or 0
        nueva_cantidad = cantidad_actual - data.numero

        if nueva_cantidad < 0:
            return "F"

        query_update = "UPDATE mesa SET cantidad = ? WHERE sucursales = ?"
        cursor.execute(query_update, (nueva_cantidad, data.sede))
        db.commit()

        return "OK"

    except pyodbc.Error as e:
        return "F"

    finally:
        if db:
            db.close()
