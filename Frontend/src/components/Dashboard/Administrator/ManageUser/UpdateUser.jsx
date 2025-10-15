import { useState, useEffect } from "react";

function UpdateUser({onUsuario}) {
    const [formData, setFormData] = useState({
        nui: "",
        estadoUsuario: "",
        cargoDesempeña: "",
        sedeOpera: "",
        nuevaContraseña: "",
        confirmarContraseña: "",
    });

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [sedes, setSedes] = useState([]);
    const [roles, setRoles] = useState([]);

    // Cargar sedes al select
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resSedes, resRoles] = await Promise.all([
                    fetch("http://localhost:8000/mesas/sedes"),
                    fetch("http://localhost:8000/usuarios/roles/listar")
                ]);

                const dataSedes = await resSedes.json();
                const dataRoles = await resRoles.json();

                setSedes(dataSedes);
                setRoles(dataRoles);
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };

        fetchData();
    }, []);

    // Buscar usuario cuando se sale del campo ID
    const handleIdBlur = async () => {
        if (!formData.nui) return;

        try {
            const res = await fetch(`http://127.0.0.1:8000/usuarios/${formData.nui}`);
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
                setError("No user was found with that ID number");
            }
        } catch (error) {
            console.error("Error getting user:", error);
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
            setError("Passwords do not match");
            return;
        }
        try {
            const response = await fetch(`http://127.0.0.1:8000/usuarios/actualizar/${formData.nui}`, {
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
                setSuccess("User updated correctly");
                setFormData({
                    nui: "",
                    estadoUsuario: "",
                    cargoDesempeña: "",
                    sedeOpera: "",
                    nuevaContraseña: "",
                    confirmarContraseña: "",
                });

                onUsuario();
            } else {
                setError("Error updating user");
            }
        } catch (error) {
            console.error("Error in the request:", error);
        }
    };

    const handleClean = () => {
        setFormData({
            nui: "",
            nombresApellidos: "",
            usuario: "",
            contraseña: "",
            cargoDesempeña: "",
            estadoUsuario: "",
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
                            <input type="number" name="nui" value={formData.nui} onChange={handleChange} onBlur={handleIdBlur} required />
                        </div>
                        <div>
                            <label>Status</label>
                            <select name="estadoUsuario" value={formData.estadoUsuario} onChange={handleChange} required>
                                <option value="" disabled hidden>Select Status</option>
                                <option value={1}>Active</option>
                                <option value={0}>Suspended</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div>
                            <label>Role</label>
                            <select name="cargoDesempeña" value={formData.cargoDesempeña} onChange={handleChange} required>
                                <option value="" disabled hidden>Select Role</option>
                                {roles.map((rol) => (
                                <option key={rol.id} value={rol.id}>
                                    {rol.cargo}
                                </option>
                            ))}
                            </select>
                        </div>
                        <div>
                            <label>Branch</label>
                            <select name="sedeOpera" value={formData.sedeOpera} onChange={handleChange} required>
                                <option value="" disabled hidden>Select Branch</option>
                                {sedes.map((sede) => (
                                    <option key={sede.id} value={sede.id}>
                                        {sede.nombre}
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
                                title="Debe tener entre 8 y 12 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial, sin espacios."
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