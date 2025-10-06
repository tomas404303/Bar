from fastapi import APIRouter
from pydantic import BaseModel
from Database import connect_to_sqlserver, execute_query, disconnect_from_sqlserver
import bcrypt

router = APIRouter()

class UsuarioBase(BaseModel):
    nui: str
    tipoDocumento: int
    nombresApellidos: str
    estadoUsuario: int
    cargoDesempeña: int
    sedeOpera: int
    usuario: str
    contraseña: str

class UpdatePassword(BaseModel):
    nuevaContraseña: str

class UpdateEstado(BaseModel):
    estadoUsuario: int

class UpdateSede(BaseModel):
    sedeOpera: int

class UpdateCargo(BaseModel):
    cargoDesempeña: int


@router.post("/usuarios/")
def crearUsuario(usuario: UsuarioBase):
    db = connect_to_sqlserver()

    hashed = bcrypt.hashpw(usuario.contraseña.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    query = """
        INSERT INTO usuario (nui, tipoDocumento, nombres_apellidos, estadoUsuario, cargoDesempeña, sedeOpera, usuario, contraseña)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    params = (
        usuario.nui,
        usuario.tipoDocumento,
        usuario.nombresApellidos,
        usuario.estadoUsuario,
        usuario.cargoDesempeña,
        usuario.sedeOpera,
        usuario.usuario,
        hashed
    )
    try:
        execute_query(query, params)
        return {"ok"}
    except Exception as e:
        print(f"Error al crear usuario: {e}")
        return {"F"}
    finally:
        disconnect_from_sqlserver(db)


@router.put("/usuarios/{id}/password")
def cambiarPassword(id: int, data: UpdatePassword):
    db = connect_to_sqlserver()
    hashed = bcrypt.hashpw(data.nuevaContraseña.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    query = "UPDATE usuario SET contraseña = ? WHERE id = ?"
    try:
        execute_query(db, query, (hashed, id))
        return {"ok"}
    except Exception as e:
        print(f"Error al actualizar contraseña: {e}")
        return {"F"}
    finally:
        disconnect_from_sqlserver(db)


@router.put("/usuarios/{id}/estado")
def cambiarEstado(id: int, data: UpdateEstado):
    db = connect_to_sqlserver()
    query = "UPDATE usuario SET estadoUsuario = ? WHERE id = ?"
    try:
        execute_query(db, query, (data.estadoUsuario, id))
        return {"ok"}
    except Exception as e:
        print(f"Error al actualizar estado: {e}")
        return {"F"}
    finally:
        disconnect_from_sqlserver(db)


@router.put("/usuarios/{id}/sede")
def cambiarSede(id: int, data: UpdateSede):
    db = connect_to_sqlserver()
    query = "UPDATE usuario SET sedeOpera = ? WHERE id = ?"
    try:
        execute_query(db, query, (data.sedeOpera, id))
        return {"OK"}
    except Exception as e:
        print(f"Error al actualizar sede: {e}")
        return {"F"}
    finally:
        disconnect_from_sqlserver(db)


@router.put("/usuarios/{id}/cargo")
def cambiarCargo(id: int, data: UpdateCargo):
    db = connect_to_sqlserver()
    query = "UPDATE usuario SET cargoDesempeña = ? WHERE id = ?"
    try:
        execute_query(db, query, (data.cargoDesempeña, id))
        return {"ok"}
    except Exception as e:
        print(f"Error al actualizar cargo: {e}")
        return {"F"}
    finally:
        disconnect_from_sqlserver(db)
