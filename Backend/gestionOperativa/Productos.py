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
    idCategoria: int
    costo: float
    precioVenta: float

class ActualizarProducto(BaseModel):
    id: int
    nombre: str | None = None
    idCategoria: int | None = None
    costo: float | None = None
    valorVenta: float | None = None

class CrearCategoria(BaseModel):
    categoria: str


def generar_nuevo_id(cursor):
    query = "SELECT ISNULL(MAX(CAST(id AS INT)), 0) + 1 FROM productos"
    cursor.execute(query)
    return cursor.fetchone()[0]


@router.get("/")
def listar_productos():
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        query = """
            SELECT 
                p.id,
                p.nombre,
                cp.categoria AS nombreCategoria,
                FORMAT(p.costo, 'N0', 'es-ES'),
                FORMAT(p.valorVenta, 'N0', 'es-ES'),
                p.idCategoria
            FROM productos p
            INNER JOIN categoriaProducto cp ON cp.id = p.idCategoria
            ORDER BY CAST(p.id AS INT)
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        return [
            {
                "id": r[0],
                "nombre": r[1],
                "categoria": r[2],
                "costo": r[3],
                "valorVenta": r[4],
                "idCategoria": r[5]
            }
            for r in rows
        ]

    except pyodbc.Error:
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
            INSERT INTO productos (id, nombre, idCategoria, costo, valorVenta)
            VALUES (?, ?, ?, ?, ?)
        """
        cursor.execute(query_insert, (
            nuevo_id,
            data.nombreProducto,
            data.idCategoria,
            data.costo,
            data.precioVenta
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
        query = """
            SELECT 
                p.id,
                p.nombre,
                cp.categoria,
                p.idCategoria,
                p.costo,
                p.valorVenta
            FROM productos p
            INNER JOIN categoriaProducto cp ON cp.id = p.idCategoria
            WHERE p.id = ?
        """
        cursor.execute(query, (id,))
        r = cursor.fetchone()

        if not r:
            return "F"

        return {
            "id": r[0],
            "nombre": r[1],
            "categoria": r[2],
            "idCategoria": r[3],
            "costo": r[4],
            "valorVenta": r[5]
        }

    except pyodbc.Error as e:
        return {"status": "F", "error": str(e)}

    finally:
        db.close()


@router.put("/")
def actualizar_producto(data: ActualizarProducto):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT id FROM productos WHERE id = ?", (data.id,))
        if not cursor.fetchone():
            db.close()
            return "F"

        fields = []
        values = []

        if data.nombre:
            fields.append("nombre = ?")
            values.append(data.nombre)

        if data.idCategoria:
            fields.append("idCategoria = ?")
            values.append(data.idCategoria)

        if data.costo is not None:
            fields.append("costo = ?")
            values.append(data.costo)

        if data.valorVenta is not None:
            fields.append("valorVenta = ?")
            values.append(data.valorVenta)

        if not fields:
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


@router.get("/categorias/listar")
def listar_categorias():
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT id, categoria FROM categoriaProducto ORDER BY categoria ASC")
        rows = cursor.fetchall()

        return [{"id": r[0], "categoria": r[1]} for r in rows]

    except pyodbc.Error as e:
        return {"status": "F", "error": str(e)}

    finally:
        db.close()


@router.post("/categorias/crear")
def crear_categoria(data: CrearCategoria):
    db = connect_to_sqlserver()
    cursor = db.cursor()

    try:
        cursor.execute("SELECT id FROM categoriaProducto WHERE categoria = ?", (data.categoria,))
        if cursor.fetchone():
            return {"status": "F", "reason": "The category already exists"}

        cursor.execute("""
            INSERT INTO categoriaProducto (categoria)
            VALUES (?)
        """, (data.categoria,))

        db.commit()
        return {"status": "OK"}

    except pyodbc.Error as e:
        return {"status": "F", "error": str(e)}

    finally:
        db.close()
