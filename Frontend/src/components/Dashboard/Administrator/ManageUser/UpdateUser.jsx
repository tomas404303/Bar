import { useState, useEffect } from "react";

function UpdateUser() {
    const [formData, setFormData] = useState({
        id: "",
        estadoUsuario: "",
        cargoDesempeña: "",
        sedeOpera: "",
        nuevaContraseña: "",
        confirmarContraseña: "",
    });

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [sedes, setSedes] = useState([]);

    // Cargar sedes al select
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resSedes] = await Promise.all([
                    fetch("http://localhost:8000/mesas/sedes")
                ]);

                const dataSedes = await resSedes.json();

                setSedes(dataSedes);
            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        };

        fetchData();
    }, []);

    // Buscar usuario cuando se sale del campo ID
    const handleIdBlur = async () => {
        if (!formData.id) return;

        try {
            const res = await fetch(`http://127.0.0.1:8000/usuarios/${formData.id}`);
            const data = await res.json();

            if (data !== "F") {
                //  Llenar los campos con los valores devueltos
                setFormData({
                    ...formData,
                    estadoUsuario: data.estadoUsuario?.toString() || "",
                    cargoDesempeña: data.cargoDesempeña?.toString() || "",
                    sedeOpera: data.sedeOpera?.toString() || "",
                });
            } else {
                setError("No se encontró un usuario con ese ID");
            }
        } catch (error) {
            console.error("Error al obtener usuario:", error);
            alert("Error al conectar con el servidor");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");

        if (formData.nuevaContraseña !== formData.confirmarContraseña) {
            setError("Las contraseñas no coinciden");
            return;
        }
        try {
            const response = await fetch(`http://127.0.0.1:8000/usuarios/${formData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    estadoUsuario: formData.estadoUsuario,
                    cargoDesempeña: formData.cargoDesempeña,
                    sedeOpera: formData.sedeOpera,
                    nuevaContraseña: formData.nuevaContraseña,
                    confirmarContraseña: formData.confirmarContraseña,
                }),
            });

            const result = await response.json();

            if (result.status === "OK") {
                setSuccess("Usuario actualizado exitosamente");
                setFormData({
                    id: "",
                    estadoUsuario: "",
                    cargoDesempeña: "",
                    sedeOpera: "",
                    nuevaContraseña: "",
                    confirmarContraseña: "",
                });
            } else {
                setError("Error al actualizar el usuario");
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            alert("No se pudo conectar con el servidor");
        }
    };

    const handleClean = () => {
        setFormData({
            tipoDocumento: "",
            nui: "",
            nombresApellidos: "",
            usuario: "",
            contraseña: "",
            cargoDesempeña: "",
            sedeOpera: "",
        })
    }

    const handleCloseModal = () => {
        setSuccess("");
        setError("");
    };

    return (
        <div>
            <section className="section" >
                <h2 className="title">Update User</h2>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div>
                            <label>ID Number</label>
                            <input type="number" name="id" value={formData.id} onChange={handleChange} onBlur={handleIdBlur} required />
                        </div>
                        <div>
                            <label>Status</label>
                            <select name="estadoUsuario" value={formData.estadoUsuario} onChange={handleChange} required>
                                <option value="" disabled selected hidden>Select Status</option>
                                <option value={1}>Active</option>
                                <option value={0}>Suspended</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div>
                            <label>Role</label>
                            <select name="cargoDesempeña" value={formData.cargoDesempeña} onChange={handleChange} required>
                                <option value="" disabled selected hidden>Select Role</option>
                                <option value={3}>Administrator</option>
                                <option value={2}>Cashier</option>
                                <option value={1}>Waiter</option>
                            </select>
                        </div>
                        <div>
                            <label>Branch</label>
                            <select name="sedeOpera" value={formData.sedeOpera} onChange={handleChange} required>
                                <option value="" disabled selected hidden>Select Branch</option>
                                {sedes.map((sede) => (
                                    <option key={sede.id} value={sede.id}>
                                        {sede.nombreSucursal}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div>
                            <label>New Password</label>
                            <input type="password" name="nuevaContraseña"
                                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,12}$"
                                title="Debe tener entre 8 y 12 caracteres, al menos una mayúscula, una minúscula, 
                                    un número y un carácter especial, sin espacios."
                                value={formData.nuevaContraseña} onChange={handleChange} placeholder="**********" />
                        </div>
                        <div>
                            <label>Confirm New Password</label>
                            <input type="password" name="confirmarContraseña" value={formData.confirmarContraseña} onChange={handleChange} placeholder="**********" />
                        </div>
                    </div>
                    <div className="button-row">
                        <button type="submit" className="save-btn">Save Changes</button>
                        <button type="button" className="cancel-btn" onClick={handleClean}>Cancel</button>
                    </div>
                </form>
                {/* Modal de Success */}
                {success && (
                    <div className="modal-success">
                        <div className="modal-content">
                            <p>{success}</p>
                            <button onClick={handleCloseModal}>OK</button>
                        </div>
                    </div>
                )}
                {/* Modal de error */}
                {error && (
                    <div className="modal-error">
                        <div className="modal-content">
                            <p>{error}</p>
                            <button onClick={handleCloseModal} >OK</button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}

export default UpdateUser