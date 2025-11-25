from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict, Any
from Database import connect_to_sqlserver
from datetime import datetime
import io, csv
from fastapi.responses import StreamingResponse

router = APIRouter(
    prefix="/reportes",
    tags=["reportes"]
)


def agrupar_recursivo(filas: List[Dict[str, Any]], claves: List[str], nivel=0):
    """
    Agrupa recursivamente listas de ventas usando llaves anidadas.
    Aunque no devuelve JSON por API, sí se usa internamente
    como parte del procesamiento antes de generar el CSV.
    """
    if nivel >= len(claves):
        return []

    clave_actual = claves[nivel]
    grupos = {}

    for fila in filas:
        valor = fila.get(clave_actual)
        grupos.setdefault(valor, []).append(fila)

    resultado = []

    for valor, grupo in grupos.items():

        cantidad = sum(float(x["cantidad"]) for x in grupo)
        venta_total = sum(float(x["venta"]) for x in grupo)
        costo_total = sum(float(x["costo"]) * float(x["cantidad"]) for x in grupo)
        ganancia_total = venta_total - costo_total

        nodo = {
            "key": valor,
            "metrics": {
                "cantidadTotal": cantidad,
                "costoTotal": round(costo_total, 2),
                "ventaTotal": round(venta_total, 2),
                "gananciaTotal": round(ganancia_total, 2)
            }
        }

        hijos = agrupar_recursivo(grupo, claves, nivel + 1)
        if hijos:
            nodo["children"] = hijos
        else:
            nodo["filas"] = grupo

        resultado.append(nodo)

    return resultado



def obtener_filas_reporte(db, fecha_inicio, fecha_fin, sede, codigo_producto):
    cursor = db.cursor()

    consulta = """
        SELECT 
            v.fechaInicioVenta,
            s.id,
            s.nombre,
            p.id,
            p.nombre,
            p.costo,
            SUM(dv.cantidad),
            SUM(dv.subTotal)
        FROM detallesVenta dv
        INNER JOIN venta v ON dv.idVenta = v.id
        INNER JOIN productos p ON dv.idProducto = p.id
        INNER JOIN sucursales s ON v.idSede = s.id
        WHERE 1 = 1
    """

    params = []

    if fecha_inicio:
        consulta += " AND v.fechaInicioVenta >= ?"
        params.append(fecha_inicio)

    if fecha_fin:
        consulta += " AND v.fechaInicioVenta <= ?"
        params.append(fecha_fin)

    if sede is not None:
        consulta += " AND s.id = ?"
        params.append(sede)

    if codigo_producto is not None:
        consulta += " AND p.id = ?"
        params.append(codigo_producto)

    consulta += """
        GROUP BY v.fechaInicioVenta, s.id, s.nombre, p.id, p.nombre, p.costo
        ORDER BY v.fechaInicioVenta ASC
    """

    cursor.execute(consulta, tuple(params))
    rows = cursor.fetchall()
    cursor.close()

    lista = []
    for f in rows:
        lista.append({
            "fecha": f[0].strftime("%Y-%m-%d %H:%M:%S"),
            "idSede": int(f[1]),
            "sede": f[2],
            "codigoProducto": int(f[3]),
            "nombreProducto": f[4],
            "costo": float(f[5]),
            "cantidad": float(f[6]),
            "venta": float(f[7])
        })

    return lista



@router.get("/ventas/exportar")
def exportar_csv(
    cargo: str = Query(...),
    sede: str = Query(...),
    fechaInicio: Optional[str] = None,
    fechaFin: Optional[str] = None,
    codigoProducto: Optional[int] = None
):
    """
    Exporta un CSV dependiendo del rol del usuario:
    - Administrator → exporta TODAS las sedes.
    - Cashier → exporta SOLO su sede.
    """

    def parse_datetime_param(valor: Optional[str]) -> Optional[datetime]:
        if not valor:
            return None
        try:
            # Permite formatos como 2025-11-01T08:00 o 2025-11-01 08:00:00
            return datetime.fromisoformat(valor)
        except ValueError:
            for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
                try:
                    return datetime.strptime(valor, fmt)
                except ValueError:
                    continue
        raise HTTPException(status_code=400, detail=f"Invalid date format for value '{valor}'")

    rol = 3 if cargo == "Administrator" else 2
    sede_usuario = sede

    fecha_inicio_dt = parse_datetime_param(fechaInicio)
    fecha_fin_dt = parse_datetime_param(fechaFin)

    db = connect_to_sqlserver()
    try:
        sede_consulta = None

        if rol == 2:
            cursor = db.cursor()
            cursor.execute(
                "SELECT id FROM sucursales WHERE nombre = ? OR CAST(id AS VARCHAR(20)) = ?",
                (sede_usuario, sede_usuario)
            )
            sede_result = cursor.fetchone()
            cursor.close()

            if not sede_result:
                raise HTTPException(status_code=404, detail="Branch not found for current user")

            sede_consulta = sede_result[0]

        filas = obtener_filas_reporte(db, fecha_inicio_dt, fecha_fin_dt, sede_consulta, codigoProducto)

        agrupar_recursivo(filas, ["sede", "codigoProducto"])

        def generador():
            buffer = io.StringIO()
            writer = csv.writer(buffer)

            writer.writerow([
                "Fecha", "Sede", "Código Producto", "Nombre Producto",
                "Cantidad", "Costo Unitario", "Venta Total", "Ganancia"
            ])

            yield buffer.getvalue()
            buffer.seek(0)
            buffer.truncate(0)

            for f in filas:
                ganancia = f["venta"] - (f["costo"] * f["cantidad"])

                writer.writerow([
                    f["fecha"],
                    f["sede"],
                    f["codigoProducto"],
                    f["nombreProducto"],
                    f["cantidad"],
                    f["costo"],
                    f["venta"],
                    round(ganancia, 2)
                ])

                yield buffer.getvalue()
                buffer.seek(0)
                buffer.truncate(0)

        nombre = f"reporte_{rol}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

        return StreamingResponse(
            generador(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={nombre}"}
        )

    finally:
        db.close()
