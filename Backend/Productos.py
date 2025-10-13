from fastapi import APIRouter
from pydantic import BaseModel
from Database import connect_to_sqlserver
import pyodbc

router = APIRouter(
    prefix="/productos",
    tags=["productos"]
)


class CrearProducto(BaseModel):
    codigoProducto: str
    nombreProducto: str
    sede: int
    categoria: int
    costo: float
    precioVenta: float
    estado: int


class ActualizarProducto(BaseModel):
    codigoProducto: str
    sede: int
    nombreProducto: str | None = None
    estado: int | None = None
    costo: float | None = None
    precioVenta: float | None = None


@router.get("/")
def listar_productos():
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query = """
            SELECT 
                p.id,
                p.codigoProducto,
                p.nombreProducto,
                p.categoria,
                p.costo,
                p.precioVenta,
                p.estado,
                s.nombre AS sede
            FROM productos p
            INNER JOIN sucursales s ON p.sede = s.id
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        if not rows:
            return "F"

        resultado = [
            {
                "id": r[0],
                "codigoProducto": r[1],
                "nombreProducto": r[2],
                "categoria": r[3],
                "costo": r[4],
                "precioVenta": r[5],
                "estado": r[6],
                "sede": r[7]
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
        query_check = """
            SELECT id FROM productos 
            WHERE codigoProducto = ? AND sede = ?
        """
        cursor.execute(query_check, (data.codigoProducto, data.sede))
        if cursor.fetchone():
            db.close()
            return "F"  

        query_insert = """
            INSERT INTO productos (codigoProducto, nombreProducto, sede, categoria, costo, precioVenta, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(query_insert, (
            data.codigoProducto,
            data.nombreProducto,
            data.sede,
            data.categoria,
            data.costo,
            data.precioVenta,
            data.estado
        ))
        db.commit()
        return "OK"

    except pyodbc.Error as e:
        return "F"
    finally:
        db.close()



@router.put("/")
def actualizar_producto(data: ActualizarProducto):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query_check = """
            SELECT id FROM productos 
            WHERE codigoProducto = ? AND sede = ?
        """
        cursor.execute(query_check, (data.codigoProducto, data.sede))
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
            WHERE codigoProducto = ? AND sede = ?
        """
        values.extend([data.codigoProducto, data.sede])

        cursor.execute(query_update, tuple(values))
        db.commit()

        return "OK"

    except pyodbc.Error as e:
        return "F"
    finally:
        db.close()
