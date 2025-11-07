from fastapi import APIRouter, Header, HTTPException
from typing import Optional, List, Dict, Any
from Database import connect_to_sqlserver
from Autenticacion.utils_token import obtener_usuario_desde_token
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
    authorization: str = Header(None),
    fechaInicio: Optional[str] = None,
    fechaFin: Optional[str] = None,
    codigoProducto: Optional[int] = None
):
    """
    Exporta un CSV dependiendo del rol del usuario:
    - Administrador (cargo=3) → exporta TODAS las sedes.
    - Cajero (cargo=2) → exporta SOLO su sede.
    """

    usuario = obtener_usuario_desde_token(authorization)
    rol = usuario["cargo"]        
    sede_usuario = usuario["sede"]

    db = connect_to_sqlserver()
    try:
        sede_consulta = None if rol == 3 else sede_usuario

        filas = obtener_filas_reporte(db, fechaInicio, fechaFin, sede_consulta, codigoProducto)

        if rol == 2:
            filas = [f for f in filas if f["idSede"] == sede_usuario]

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
