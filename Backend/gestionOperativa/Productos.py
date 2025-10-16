from fastapi import APIRouter
from pydantic import BaseModel
from Database import connect_to_sqlserver
import pyodbc

router = APIRouter(
    prefix="/productos",
    tags=["productos"]
)

class CrearProducto(BaseModel):
    nombreProducto: str
    categoria: str
    costo: float
    precioVenta: float
    estado: int


class ActualizarProducto(BaseModel):
    id: int
    nombreProducto: str | None = None
    estado: int | None = None
    costo: float | None = None
    precioVenta: float | None = None


def generar_nuevo_id(cursor):
    query = "SELECT ISNULL(MAX(id), 0) + 1 FROM productos"
    cursor.execute(query)
    nuevo_id = cursor.fetchone()[0]
    return nuevo_id


@router.get("/")
def listar_productos():
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query = """
            SELECT 
                p.id, p.nombreProducto, p.categoria,
                FORMAT(p.costo, 'N0', 'es-ES'), 
                FORMAT(p.precioVenta, 'N0', 'es-ES'), 
                p.estado
            FROM productos p
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        if not rows:
            return "F"

        resultado = [
            {
                "id": r[0],
                "nombreProducto": r[1],
                "categoria": r[2],
                "costo": r[3],
                "precioVenta": r[4],
                "estado": r[5],
            }
            for r in rows
        ]
        return resultado

    except pyodbc.Error as e:
        return "F"
    finally:
        db.close()


@router.post("/")
def agregar_producto(data: CrearProducto):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        nuevo_id = generar_nuevo_id(cursor)

        query_insert = """
            INSERT INTO productos (id, nombreProducto, categoria, costo, precioVenta, estado)
            VALUES (?, ?, ?, ?, ?, ?)
        """
        cursor.execute(query_insert, (
            nuevo_id,
            data.nombreProducto,
            data.categoria,
            data.costo,
            data.precioVenta,
            data.estado
        ))
        db.commit()
        return {"status": "OK", "idGenerado": nuevo_id}

    except pyodbc.Error as e:
        return {"status": "F", "error": str(e)}
    finally:
        db.close()


@router.get("/{id}")
def obtener_producto(id: int):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query = "SELECT * FROM productos WHERE id = ?"
        cursor.execute(query, (id,))
        result = cursor.fetchone()

        if not result:
            return "F"

        columns = [column[0] for column in cursor.description]
        data = dict(zip(columns, result))
        return data

    except pyodbc.Error as e:
        return {"status": "F", "error": str(e)}
    finally:
        db.close()


@router.put("/")
def actualizar_producto(data: ActualizarProducto):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query_check = "SELECT id FROM productos WHERE id = ?"
        cursor.execute(query_check, (data.id,))
        if not cursor.fetchone():
            db.close()
            return "F"

        fields = []
        values = []

        if data.nombreProducto is not None:
            fields.append("nombreProducto = ?")
            values.append(data.nombreProducto)

        if data.estado is not None:
            fields.append("estado = ?")
            values.append(data.estado)

        if data.costo is not None:
            fields.append("costo = ?")
            values.append(data.costo)

        if data.precioVenta is not None:
            fields.append("precioVenta = ?")
            values.append(data.precioVenta)

        if not fields:
            db.close()
            return "F"

        query_update = f"""
            UPDATE productos
            SET {', '.join(fields)}
            WHERE id = ? 
        """
        values.append(data.id)

        cursor.execute(query_update, tuple(values))
        db.commit()

        return {"status": "OK"}

    except pyodbc.Error as e:
        return {"status": "F", "error": str(e)}
    finally:
        db.close()
