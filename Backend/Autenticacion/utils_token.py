from fastapi import HTTPException
from Autenticacion.JWT import VerificarToken

def obtener_usuario_desde_token(authorization: str):

    if not authorization:
        raise HTTPException(status_code=401, detail="Token requerido")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Formato de token inválido")

    token = authorization.replace("Bearer ", "").strip()
    payload = VerificarToken(token)

    if payload is None:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    return payload
