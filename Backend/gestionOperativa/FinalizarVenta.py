from fastapi import APIRouter
from pydantic import BaseModel
from Database import connect_to_sqlserver
import pyodbc

router = APIRouter(
    prefix="/finalizar",
    tags=["finalizar venta"]
)

class SeleccionarMesa(BaseModel):
    idSede: int
    numeroMesa: int

class ConfirmarPago(BaseModel):
    idSede: int
    numeroMesa: int
    metodoPago: int  



@router.get("/mesas/{idSede}")
def obtener_mesas(idSede: int):

    db = connect_to_sqlserver()
    cursor = db.cursor()

    cursor.execute("""
        SELECT 
            numeroMesaAsociada,
            estadoVenta
        FROM venta
        WHERE idSede = ? AND fechaFinVenta IS NULL
    """, (idSede,))

    rows = cursor.fetchall()
    db.close()

    mesas = []
    for r in rows:
        mesas.append({
            "numeroMesa": r[0],
            "estado": "ocupado" if r[1] == 1 else "libre"
        })

    return mesas




@router.post("/detalle")
def obtener_detalle(data: SeleccionarMesa):

    db = connect_to_sqlserver()
    cursor = db.cursor()

    cursor.execute("""
        SELECT id, total
        FROM venta
        WHERE idSede = ? 
          AND numeroMesaAsociada = ?
          AND fechaFinVenta IS NULL
    """, (data.idSede, data.numeroMesa))

    venta = cursor.fetchone()

    if not venta:
        db.close()
        return {"estado": "libre", "productos": []}

    idVenta = venta[0]

    cursor.execute("""
        SELECT 
            p.nombre,
            dv.cantidad,
            dv.precioVenta,
            dv.subTotal
        FROM detallesVenta dv
        JOIN productos p ON p.id = dv.idProducto
        WHERE dv.idVenta = ?
    """, (idVenta,))

    rows = cursor.fetchall()
    db.close()

    total = sum(r[3] for r in rows)

    return {
        "estado": "ocupado",
        "productos": [
            {
                "nombre": r[0],
                "cantidad": r[1],
                "precioUnitario": r[2],
                "subtotal": r[3]
            }
            for r in rows
        ],
        "total": total
    }



@router.post("/confirmar")
def confirmar_venta(data: ConfirmarPago):

    db = connect_to_sqlserver()
    cursor = db.cursor()

    cursor.execute("""
        SELECT id 
        FROM venta
        WHERE idSede = ?
        AND numeroMesaAsociada = ?
        AND fechaFinVenta IS NULL
    """, (data.idSede, data.numeroMesa))

    row = cursor.fetchone()

    if not row:
        db.close()
        return {"status": "F", "reason": "There is no active sale for this table"}

    idVenta = row[0]

    cursor.execute("""
        SELECT SUM(subTotal)
        FROM detallesVenta
        WHERE idVenta = ?
    """, (idVenta,))

    total = cursor.fetchone()[0] or 0

    cursor.execute("""
        UPDATE venta
        SET 
            medioRecaudado = ?,
            total = ?,
            fechaFinVenta = GETDATE(),
            estadoVenta = 0
        WHERE id = ?
    """, (data.metodoPago, total, idVenta))

    db.commit()
    db.close()

    return {
        "status": "OK",
        "idVenta": idVenta,
        "totalCobrado": total,
        "metodoPago": data.metodoPago
    }
