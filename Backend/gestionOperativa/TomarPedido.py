from fastapi import APIRouter
from pydantic import BaseModel
from Database import connect_to_sqlserver
import pyodbc

router = APIRouter(
    prefix="/pedido",
    tags=["pedido"]
)



class ItemPedido(BaseModel):
    idProducto: int
    cantidad: int

class CrearPedido(BaseModel):
    idSede: int
    numeroMesa: int
    medioRecaudo: int
    productos: list[ItemPedido]

class ActualizarPedido(BaseModel):
    idSede: int
    numeroMesa: int
    productos: list[ItemPedido]


@router.get("/sedes")
def listarSedesActivas():
    db = connect_to_sqlserver()
    cursor = db.cursor()
    cursor.execute("SELECT id, nombre FROM sucursales WHERE estado = 1")
    rows = cursor.fetchall()
    db.close()

    return [{"id": r[0], "nombre": r[1]} for r in rows]



@router.get("/mesas/{idSede}")
def obtener_mesas(idSede: int):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    cursor.execute("SELECT cantidad FROM mesa WHERE sedeDefinido = ?", (idSede,))
    row = cursor.fetchone()
    db.close()

    if not row:
        return {"status": "F", "reason": "The venue has no registered tables"}

    return {"mesas": row[0]}


@router.get("/productos/{idSede}")
def productos_disponibles(idSede: int):
    db = connect_to_sqlserver()
    cursor = db.cursor()

    query = """
        SELECT 
            p.id,
            p.nombre,
            cp.categoria AS nombreCategoria,
            i.cantidad AS disponible
        FROM productos p
        JOIN inventario i ON i.idProducto = p.id
        JOIN categoriaProducto cp ON cp.id = p.idCategoria
        WHERE i.idSucursal = ? AND i.cantidad > 0
        ORDER BY i.cantidad DESC
    """

    cursor.execute(query, (idSede,))
    rows = cursor.fetchall()
    db.close()

    return [
        {
            "id": r[0],
            "nombre": r[1],
            "categoria": r[2],
            "disponible": r[3]
        }
        for r in rows
    ]

@router.post("/crear")
def crear_pedido(data: CrearPedido):

    db = connect_to_sqlserver()
    cursor = db.cursor()

    try:
        cursor.execute("""
            INSERT INTO venta (
                idSede,
                estadoVenta,
                medioRecaudado,
                total,
                numeroMesaAsociada,
                fechaInicioVenta
            )
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, 0, ?, GETDATE())
        """, (
            data.idSede,
            1,                     
            data.medioRecaudo,     
            data.numeroMesa       
        ))

        row = cursor.fetchone()
        if not row:
            db.rollback()
            return {"status": "F", "reason": "No se generó idVenta"}

        idVenta = row[0]
        total_venta = 0

        for item in data.productos:

            cursor.execute("""
                SELECT cantidad FROM inventario
                WHERE idSucursal = ? AND idProducto = ?
            """, (data.idSede, item.idProducto))
            row = cursor.fetchone()

            if not row:
                db.rollback()
                return {"status": "F", "reason": f"Producto {item.idProducto} no está en inventario"}

            inventario_actual = row[0]

            if inventario_actual < item.cantidad:
                db.rollback()
                return {"status": "F", "reason": f"Inventario insuficiente para el producto {item.idProducto}"}

            cursor.execute("SELECT valorVenta FROM productos WHERE id = ?", (item.idProducto,))
            precio = cursor.fetchone()[0]

            subtotal = precio * item.cantidad
            total_venta += subtotal

            cursor.execute("""
                INSERT INTO detallesVenta (
                    idVenta,
                    idProducto,
                    fechaProcesado,
                    cantidad,
                    precioVenta,
                    subTotal
                )
                VALUES (?, ?, GETDATE(), ?, ?, ?)
            """, (
                idVenta,
                item.idProducto,
                item.cantidad,
                precio,
                subtotal
            ))

            cursor.execute("""
                UPDATE inventario
                SET cantidad = cantidad - ?
                WHERE idSucursal = ? AND idProducto = ?
            """, (item.cantidad, data.idSede, item.idProducto))

        cursor.execute("""
            UPDATE venta SET total = ?
            WHERE id = ?
        """, (total_venta, idVenta))

        db.commit()
        return {"status": "OK", "idVenta": idVenta, "total": total_venta}

    except Exception as e:
        db.rollback()
        return {"status": "F", "error": str(e)}

    finally:
        db.close()


@router.post("/actualizar-por-mesa")
def actualizar_pedido_por_mesa(data: ActualizarPedido):

    db = connect_to_sqlserver()
    cursor = db.cursor()

    try:
        cursor.execute("""
            SELECT id
            FROM venta
            WHERE idSede = ?
              AND numeroMesaAsociada = ?
              AND estadoVenta = 1
              AND fechaFinVenta IS NULL
        """, (data.idSede, data.numeroMesa))

        row = cursor.fetchone()

        if not row:
            return {
                "status": "F",
                "reason": "There is no active order at this table"
            }

        idVenta = row[0]
        total_adicional = 0

        for item in data.productos:

            cursor.execute("""
                SELECT cantidad
                FROM inventario
                WHERE idSucursal = ? AND idProducto = ?
            """, (data.idSede, item.idProducto))
            inv = cursor.fetchone()

            if not inv:
                return {
                    "status": "F",
                    "reason": f"Product {item.idProducto} not in stock"
                }

            inventario_actual = inv[0]

            if inventario_actual < item.cantidad:
                return {
                    "status": "F",
                    "reason": f"Insufficient inventory for the product{item.idProducto}"
                }

            cursor.execute("""
                SELECT cantidad
                FROM detallesVenta
                WHERE idVenta = ? AND idProducto = ?
            """, (idVenta, item.idProducto))
            detalle = cursor.fetchone()

            cursor.execute("SELECT valorVenta FROM productos WHERE id = ?", (item.idProducto,))
            precio = cursor.fetchone()[0]

            if detalle:
                cantidad_nueva = detalle[0] + item.cantidad
                subtotal_nuevo = cantidad_nueva * precio

                cursor.execute("""
                    UPDATE detallesVenta
                    SET cantidad = ?, subTotal = ?
                    WHERE idVenta = ? AND idProducto = ?
                """, (cantidad_nueva, subtotal_nuevo, idVenta, item.idProducto))

                total_adicional += item.cantidad * precio

            else:
                subtotal = item.cantidad * precio
                total_adicional += subtotal

                cursor.execute("""
                    INSERT INTO detallesVenta (
                        idVenta,
                        idProducto,
                        fechaProcesado,
                        cantidad,
                        precioVenta,
                        subTotal
                    )
                    VALUES (?, ?, GETDATE(), ?, ?, ?)
                """, (
                    idVenta,
                    item.idProducto,
                    item.cantidad,
                    precio,
                    subtotal
                ))

            cursor.execute("""
                UPDATE inventario
                SET cantidad = cantidad - ?
                WHERE idSucursal = ? AND idProducto = ?
            """, (item.cantidad, data.idSede, item.idProducto))

        cursor.execute("""
            UPDATE venta 
            SET total = total + ?
            WHERE id = ?
        """, (total_adicional, idVenta))

        db.commit()

        return {
            "status": "OK",
            "idVenta": idVenta,
            "totalAgregado": total_adicional
        }

    except Exception as e:
        db.rollback()
        return {"status": "F", "error": str(e)}

    finally:
        db.close()



@router.get("/activos")
def listar_pedidos_activos():
    db = connect_to_sqlserver()
    cursor = db.cursor()

    try:
        cursor.execute("""
            SELECT 
                v.id,
                v.idSede,
                v.numeroMesaAsociada,
                v.total,
                v.fechaInicioVenta
            FROM venta v
            WHERE v.estadoVenta = 1
              AND v.fechaFinVenta IS NULL
            ORDER BY v.fechaInicioVenta DESC
        """)
        
        rows = cursor.fetchall()

        pedidos = [
            {
                "idVenta": r[0],
                "idSede": r[1],
                "numeroMesa": r[2],
                "total": float(r[3]),
                "fechaInicio": r[4]
            }
            for r in rows
        ]

        return {"status": "OK", "pedidos": pedidos}

    except Exception as e:
        return {"status": "F", "error": str(e)}

    finally:
        db.close()


