from fastapi import APIRouter, Query
from pydantic import BaseModel
from Database import connect_to_sqlserver
import pyodbc
from typing import Union

router = APIRouter(
    prefix="/inventario",
    tags=["inventario"]
)

class InventarioItem(BaseModel):
    idSucursal: Union[int, str]
    idProducto: int
    cantidad: int

@router.get("/")
def listar_inventario(cargo: str = Query(...), sede: str = Query(None)):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        if cargo == "Administrator":
            query = """
                SELECT 
                    i.idProducto, p.nombre, i.idSucursal, 
                    s.nombre as nombreSede, i.cantidad, 
                    FORMAT(p.valorVenta, 'N0', 'es-ES'), 
                    cp.categoria
                FROM inventario i
                JOIN productos p ON i.idProducto = p.id
                JOIN sucursales s ON i.idSucursal = s.id
                JOIN categoriaProducto cp ON cp.id = p.idCategoria
            """
            cursor.execute(query)
        else:
            query = """
                SELECT i.idProducto, p.nombre, i.idSucursal, 
                    s.nombre as nombreSede, i.cantidad, FORMAT(p.valorVenta, 'N0', 'es-ES'), 
                    cp.categoria
                FROM inventario i
                JOIN productos p ON i.idProducto = p.id
                JOIN sucursales s ON i.idSucursal = s.id
                JOIN categoriaProducto cp ON cp.id = p.idCategoria
                WHERE s.nombre = ?
            """
            cursor.execute(query, (sede,))

        rows = cursor.fetchall()
        result = []
        for r in rows:
            result.append({
                "idProducto": r[0],
                "nombre": r[1],
                "idSucursal": r[2],
                "sede": r[3],
                "cantidad": r[4],
                "valorVenta": r[5],
                "categoria": r[6],
            })

        return result

    except pyodbc.Error as e:
        return {"status": "F", "error": str(e)}
    finally:
        db.close()

@router.post("/")
def agregar_o_actualizar_inventario(data: InventarioItem):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:

        if isinstance(data.idSucursal, str):
            cursor.execute("SELECT id FROM sucursales WHERE nombre = ?", (data.idSucursal,))
            sede_result = cursor.fetchone()
            if sede_result:
                data.idSucursal = sede_result[0]

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

@router.get("/sedes")
def listar_sedes(cargo: str = Query(...), sede: str = Query(None)):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        if cargo == "Administrator":
            cursor.execute("SELECT id, nombre FROM sucursales WHERE estado = 1")
        else:
            cursor.execute("SELECT id, nombre FROM sucursales WHERE estado = 1 AND nombre = ?", (sede,))
        
        rows = cursor.fetchall()
        result = [{"id": r[0], "nombre": r[1]} for r in rows]
        return result

    except pyodbc.Error as e:
        return {"status": "F", "error": str(e)}
    finally:
        db.close()