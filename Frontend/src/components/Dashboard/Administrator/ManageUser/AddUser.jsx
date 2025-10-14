import { useState, useEffect } from "react";

function AddUser() {
    const [formData, setFormData] = useState({
        tipoDocumento: "",
        nui: "",
        nombresApellidos: "",
        usuario: "",
        contraseña: "",
        cargoDesempeña: "",
        sedeOpera: "",
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");

        try {
            const response = await fetch("http://localhost:8000/usuarios/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nui: formData.nui,
                    tipoDocumento: formData.tipoDocumento,
                    nombresApellidos: formData.nombresApellidos,
                    estadoUsuario: 1, // puedes ajustar esto
                    cargoDesempeña: formData.cargoDesempeña,
                    sedeOpera: formData.sedeOpera,
                    usuario: formData.usuario,
                    contraseña: formData.contraseña,
                }),
            });

            const result = await response.json();

            if (result.status === "OK") {
                setSuccess("Usuario creado exitosamente");
                setFormData({
                    tipoDocumento: "",
                    nui: "",
                    nombresApellidos: "",
                    usuario: "",
                    contraseña: "",
                    cargoDesempeña: "",
                    sedeOpera: "",
                });
            } else {
                setError("No se pudo crear el usuario");
            }
        } catch (error) {
            console.error("Error:", error);
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
        <section className="section">
            <h2 className="title">Add User</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div>
                        <label>ID Type</label>
                        <select name="tipoDocumento" value={formData.tipoDocumento}
                            onChange={handleChange} required>
                            <option value="" disabled selected hidden>Select ID Type</option>
                            <option value={3}>nui</option>
                        </select>
                    </div>
                    <div>
                        <label>ID Number</label>
                        <input type="text" maxlength="10" pattern="\d{10}"
                            oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                            title="Debe contener exactamente 10 números y sin espacios"
                            name="nui" value={formData.nui} onChange={handleChange} required />
                    </div>
                </div>

                <div className="form-row">
                    <div>
                        <label>Full Name</label>
                        <input type="text" pattern="[A-Za-záéíóúÁÉÍÓÚñÑ\s]+"
                            title="Debe contener solo letras" name="nombresApellidos"
                            value={formData.nombresApellidos} onChange={handleChange} required />
                    </div>
                </div>

                <div className="form-row">
                    <div>
                        <label>Username</label>
                        <input type="text" pattern="[A-Za-záéíóúÁÉÍÓÚñÑ]+"
                            title="Debe contener solo letras y sin espacios" name="usuario"
                            value={formData.usuario} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Password</label>
                        <input type="password" name="contraseña" 
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,12}$" 
                        title="Debe tener entre 8 y 12 caracteres, al menos una mayúscula, una minúscula, 
                        un número y un carácter especial, sin espacios."  value={formData.contraseña}
                            onChange={handleChange} placeholder="**********" required />
                    </div>
                </div>

                <div className="form-row">
                    <div>
                        <label>Role</label>
                        <select name="cargoDesempeña" value={formData.cargoDesempeña}
                            onChange={handleChange} required>
                            <option value="" disabled selected hidden>Select Role</option>
                            <option value={3}>Administrator</option>
                            <option value={2}>Cashier</option>
                            <option value={1}>Waiter</option>
                        </select>
                    </div>
                    <div>
                        <label>Branch</label>
                        <select name="sedeOpera" value={formData.sedeOpera}
                            onChange={handleChange} required>
                            <option value="" disabled selected hidden>Select Branch</option>
                            {sedes.map((sede) => (
                                <option key={sede.id} value={sede.id}>
                                    {sede.nombreSucursal}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="button-row">
                    <button type="submit" className="save-btn">Save User</button>
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
    )
}

export default AddUser