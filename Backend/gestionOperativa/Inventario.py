from fastapi import APIRouter
from pydantic import BaseModel
from Database import connect_to_sqlserver
import pyodbc

router = APIRouter(
    prefix="/inventario",
    tags=["inventario"]
)

class InventarioItem(BaseModel):
    idSucursal: int
    idProducto: int
    cantidad: int


@router.post("/")
def agregar_o_actualizar_inventario(data: InventarioItem):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query_estado = "SELECT estado FROM sucursales WHERE id = ?"
        cursor.execute(query_estado, (data.idSucursal,))
        result_estado = cursor.fetchone()

        if not result_estado:
            return {"status": "F", "reason": "Sede no encontrada"}

        if result_estado[0] == 0:
            return {"status": "F", "reason": "No se puede crear inventario en una sede inactiva"}

        query_check = """
            SELECT cantidad 
            FROM inventario 
            WHERE idSucursal = ? AND idProducto = ?
        """
        cursor.execute(query_check, (data.idSucursal, data.idProducto))
        result = cursor.fetchone()

        if result:
            cantidad_actual = result[0]
            nueva_cantidad = cantidad_actual + data.cantidad

            query_update = """
                UPDATE inventario
                SET cantidad = ?
                WHERE idSucursal = ? AND idProducto = ?
            """
            cursor.execute(query_update, (nueva_cantidad, data.idSucursal, data.idProducto))
            db.commit()
            return {"status": "OK", "accion": "actualizado", "nuevaCantidad": nueva_cantidad}

        else:
            query_insert = """
                INSERT INTO inventario (idSucursal, idProducto, cantidad)
                VALUES (?, ?, ?)
            """
            cursor.execute(query_insert, (data.idSucursal, data.idProducto, data.cantidad))
            db.commit()
            return {"status": "OK", "accion": "creado"}

    except pyodbc.Error as e:
        return {"status": "F", "error": str(e)}

    finally:
        db.close()
