from fastapi import APIRouter, Query, Body
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

# Modelo para agregar producto a preorden
class PreOrdenItem(BaseModel):
    idVenta: int
    idProducto: str
    cantidad: int
    precioVenta: float
    subTotal: float


def merge_sort(lista, clave):
    if len(lista) <= 1:
        return lista

    medio = len(lista) // 2
    izquierda = merge_sort(lista[:medio], clave)
    derecha = merge_sort(lista[medio:], clave)

    return merge(izquierda, derecha, clave)

def merge(izquierda, derecha, clave):
    resultado = []
    i = j = 0

    while i < len(izquierda) and j < len(derecha):
        # Ordenar de mayor a menor
        if izquierda[i][clave] >= derecha[j][clave]:
            resultado.append(izquierda[i])
            i += 1
        else:
            resultado.append(derecha[j])
            j += 1

    resultado.extend(izquierda[i:])
    resultado.extend(derecha[j:])
    return resultado




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




@router.get("/productos/")
def productos_disponibles(cargo: str = Query(...), sede: str = Query(None)):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        if cargo == "Administrator":
            query = """
                SELECT 
                    p.id,
                    p.nombre,
                    cp.categoria AS disponible,
                    i.cantidad, s.nombre,
                    FORMAT(p.valorVenta, 'N0', 'es-ES'),
                    i.idSucursal
                FROM productos p
                JOIN inventario i ON i.idProducto = p.id
                JOIN sucursales s ON i.idSucursal = s.id
                JOIN categoriaProducto cp ON cp.id = p.idCategoria
                WHERE i.cantidad > 0
            """
            cursor.execute(query)
        else:
            query = """
                SELECT 
                    p.id,
                    p.nombre,
                    cp.categoria AS disponible,
                    i.cantidad, 
                    s.nombre,
                    FORMAT(p.valorVenta, 'N0', 'es-ES'),
                    i.idSucursal
                FROM productos p
                JOIN inventario i ON i.idProducto = p.id
                JOIN sucursales s ON i.idSucursal = s.id
                JOIN categoriaProducto cp ON cp.id = p.idCategoria
                WHERE s.nombre = ? AND i.cantidad > 0
            """
            cursor.execute(query, (sede,))

        rows = cursor.fetchall()
        result = []

        for r in rows:
            result.append({
                "idProducto": r[0],
                "nombre": r[1],
                "categoria": r[2],
                "cantidad": r[3],
                "sede": r[4],
                "valorVenta": r[5],
                "idSucursal": r[6],
            })

        productos_ordenados = merge_sort(result, "cantidad")
        return productos_ordenados
    
    except pyodbc.Error as e:
        return {"status": "F", "error": str(e)}
    finally:
        db.close()

@router.get("/estado-mesa/{sede}/{numeroMesa}")
def estado_mesa(sede: int, numeroMesa: int):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        cursor.execute("""
            SELECT estadoVenta
            FROM venta
            WHERE idSede = ? AND numeroMesaAsociada = ? AND fechaFinVenta IS NULL
        """, (sede, numeroMesa))
        row = cursor.fetchone()
        if row:
            estado = int(row[0])  # <-- conversión explícita
            return {"status": "OK", "estadoVenta": estado}
        else:
            return {"status": "OK", "estadoVenta": 0}  # 0: desocupada
    except Exception as e:
        return {"status": "F", "error": str(e)}
    finally:
        db.close()

@router.post("/crear/venta")
def crear_venta(sede: int = Query(...), numeroMesa: int = Query(...)):
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
            VALUES (?, ?, 1, 0, ?, GETDATE())
        """, (
            sede,
            1,
            numeroMesa
        ))
        row = cursor.fetchone()
        if not row:
            db.rollback()
            return {"status": "F", "reason": "No idVenta was generated"}
        idVenta = row[0]
        db.commit()
        # Consultar el estado actualizado de la mesa
        cursor.execute("""
            SELECT estadoVenta
            FROM venta
            WHERE idSede = ? AND numeroMesaAsociada = ? AND fechaFinVenta IS NULL
        """, (sede, numeroMesa))
        estado_row = cursor.fetchone()
        if estado_row:
            estado_mesa = int(estado_row[0])
        else:
            estado_mesa = 0
        return {"status": "OK", "idVenta": idVenta, "estadoMesa": estado_mesa}
    except Exception as e:
        db.rollback()
        return {"status": "F", "error": str(e)}
    finally:
        db.close()

# Endpoint para agregar producto a detallesVentaPreOrden
@router.post("/preorden/agregar-producto")
def agregar_producto_preorden(item: PreOrdenItem = Body(...)):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        # Validar inventario
        cursor.execute("""
            SELECT v.idSede FROM venta v WHERE v.id = ?
        """, (item.idVenta,))
        sede_row = cursor.fetchone()
        if not sede_row:
            return {"status": "F", "error": "Venta no encontrada"}
        idSucursal = sede_row[0]
        cursor.execute("""
            SELECT cantidad FROM inventario WHERE idSucursal = ? AND idProducto = ?
        """, (idSucursal, item.idProducto))
        inv_row = cursor.fetchone()
        if not inv_row:
            return {"status": "F", "error": "Producto no encontrado en inventario"}
        inventario_actual = inv_row[0]
        if item.cantidad > inventario_actual or item.cantidad <= 0:
            return {"status": "F", "error": "Cantidad inválida o insuficiente inventario"}
        # Insertar en detallesVentaPreOrden
        cursor.execute("""
            INSERT INTO detallesVentaPreOrden (idVenta, idProducto, cantidad, precioVenta, subTotal)
            VALUES (?, ?, ?, ?, ?)
        """, (item.idVenta, item.idProducto, item.cantidad, item.precioVenta, item.subTotal))
        db.commit()
        return {"status": "OK"}
    except Exception as e:
        db.rollback()
        return {"status": "F", "error": str(e)}
    finally:
        db.close()

@router.get("/preorden/detalles/{idVenta}")
def listar_detalles_preorden(idVenta: int):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        cursor.execute("""
            SELECT idVenta, idProducto, p.nombre, cantidad, precioVenta, subTotal
            FROM detallesVentaPreOrden
            JOIN productos p ON detallesVentaPreOrden.idProducto = p.id
            WHERE idVenta = ?
        """, (idVenta,))
        rows = cursor.fetchall()
        detalles = [
            {
                "idVenta": r[0],
                "idProducto": r[1],
                "nombre": r[2],
                "cantidad": r[3],
                "precioVenta": r[4],
                "subTotal": r[5]
            }
            for r in rows
        ]
        return {"status": "OK", "idVenta": idVenta, "detalles": detalles}
    except Exception as e:
        return {"status": "F", "error": str(e)}
    finally:
        db.close()


@router.post("/cerrar")
def cerrar_venta(idVenta: int = Query(...), medioRecaudado: int = Query(...), total: float = Query(...)):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        cursor.execute("""
            UPDATE venta
            SET estadoVenta = 0,
                medioRecaudado = ?,
                total = ?,
                fechaFinVenta = GETDATE()
            WHERE id = ?
        """, (medioRecaudado, total, idVenta))
        if cursor.rowcount == 0:
            db.rollback()
            return {"status": "F", "error": "No active sale found."}
        db.commit()
        return {"status": "OK"}
    except Exception as e:
        db.rollback()
        return {"status": "F", "error": str(e)}
    finally:
        db.close()

@router.post("/preorden/confirmar/{idVenta}")
def confirmar_preorden(idVenta: int):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        # Obtener todos los productos de la preorden
        cursor.execute("""
            SELECT idProducto, cantidad, precioVenta, subTotal
            FROM detallesVentaPreOrden
            WHERE idVenta = ?
        """, (idVenta,))
        productos = cursor.fetchall()
        if not productos:
            return {"status": "F", "error": "No products in pre-order"}
        # Insertar en detallesVenta
        for p in productos:
            cursor.execute("""
                INSERT INTO detallesVenta (idVenta, idProducto, fechaProcesado, cantidad, precioVenta, subTotal)
                VALUES (?, ?, GETDATE(), ?, ?, ?)
            """, (idVenta, p[0], p[1], p[2], p[3]))
        # Eliminar de detallesVentaPreOrden
        cursor.execute("""
            DELETE FROM detallesVentaPreOrden WHERE idVenta = ?
        """, (idVenta,))
        db.commit()
        return {"status": "OK"}
    except Exception as e:
        db.rollback()
        return {"status": "F", "error": str(e)}
    finally:
        db.close()

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
            return {"status": "F", "reason": "No idVenta was generated"}

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
                return {"status": "F", "reason": f"the product {item.idProducto} not in inventory"}

            inventario_actual = row[0]

            if inventario_actual < item.cantidad:
                db.rollback()
                return {"status": "F", "reason": f"Insufficient inventory for the product {item.idProducto}"}

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
                "reason": "There is no active order at this table."
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
                return {"status": "F", "reason": f"Product {item.idProducto} not in inventory"}

            inventario_actual = inv[0]

            if inventario_actual < item.cantidad:
                return {"status": "F", "reason": f"Insufficient inventory for product {item.idProducto}"}

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

                total_adicional += (item.cantidad * precio)

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


@router.get("/detalles/mesa")
def detalles_venta_por_mesa(idSede: int = Query(...), numeroMesa: int = Query(...)):
    db = connect_to_sqlserver()
    cursor = db.cursor()
    try:
        cursor.execute("""
            SELECT v.id
            FROM venta v
            WHERE v.idSede = ?
              AND v.numeroMesaAsociada = ?
              AND v.estadoVenta = 1
              AND v.fechaFinVenta IS NULL
        """, (idSede, numeroMesa))
        venta_row = cursor.fetchone()
        if not venta_row:
            return {"status": "OK", "idVenta": None, "detalles": []}

        idVenta = venta_row[0]
        cursor.execute("""
            SELECT dv.idProducto, p.nombre, dv.precioVenta,
                   SUM(dv.cantidad) AS cantidad, SUM(dv.subTotal) AS subTotal
            FROM detallesVenta dv
            JOIN productos p ON dv.idProducto = p.id
            WHERE dv.idVenta = ?
            GROUP BY dv.idProducto, p.nombre, dv.precioVenta
        """, (idVenta,))
        rows = cursor.fetchall()

        detalles = [
            {
                "idProducto": r[0],
                "nombre": r[1],
                "precioVenta": float(r[2]),
                "cantidad": int(r[3]),
                "subTotal": float(r[4])
            }
            for r in rows
        ]

        return {"status": "OK", "idVenta": idVenta, "detalles": detalles}


    except Exception as e:
        return {"status": "F", "error": str(e)}
    finally:
        db.close()
