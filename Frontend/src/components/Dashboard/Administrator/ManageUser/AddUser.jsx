import { useState, useEffect } from "react";

function AddUser({onUsuario}) {
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
    const [documentos, setDocumentos] = useState([]);
    const [roles, setRoles] = useState([]);

    // Cargar sedes al select
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resSedes, resDocumentos, resRoles] = await Promise.all([
                    fetch("http://localhost:8000/mesas/sedes"),
                    fetch("http://localhost:8000/usuarios/documentos/listar"),
                    fetch("http://localhost:8000/usuarios/roles/listar")
                ]);

                const dataSedes = await resSedes.json();
                const dataDocumentos = await resDocumentos.json();
                const dataRoles = await resRoles.json();

                setSedes(dataSedes);
                setDocumentos(dataDocumentos);
                setRoles(dataRoles);
            } catch (error) {
                console.error("Error loading data:", error);
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
                setSuccess("User created correctly");
                setFormData({
                    tipoDocumento: "",
                    nui: "",
                    nombresApellidos: "",
                    usuario: "",
                    contraseña: "",
                    cargoDesempeña: "",
                    sedeOpera: "",
                });

                onUsuario();
            } else {
                setError("Error creating user");
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
                            <option value="" disabled hidden>Select ID Type</option>
                            {documentos.map((documento) => (
                                <option key={documento.id} value={documento.id}>
                                    {documento.definicion}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>ID Number</label>
                        <input type="text" maxLength="10" pattern="\d{10}"
                            onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                            title="Must contain exactly 10 digits and no spaces"
                            name="nui" value={formData.nui} onChange={handleChange} required />
                    </div>
                </div>

                <div className="form-row">
                    <div>
                        <label>Full Name</label>
                        <input type="text" pattern="[A-Za-záéíóúÁÉÍÓÚñÑ\s]+"
                            title="Must contain only letters" name="nombresApellidos"
                            value={formData.nombresApellidos} onChange={handleChange} required />
                    </div>
                </div>

                <div className="form-row">
                    <div>
                        <label>Username</label>
                        <input type="text" pattern="[A-Za-záéíóúÁÉÍÓÚñÑ]+"
                            title="Must contain only letters and no spaces" name="usuario"
                            value={formData.usuario} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Password</label>
                        <input type="password" name="contraseña" 
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,12}$" 
                        title="Must be between 8 and 12 characters, at least one uppercase letter, one lowercase letter, one number, and one special character, with no spaces"  value={formData.contraseña}
                            onChange={handleChange} placeholder="**********" required />
                    </div>
                </div>

                <div className="form-row">
                    <div>
                        <label>Role</label>
                        <select name="cargoDesempeña" value={formData.cargoDesempeña}
                            onChange={handleChange} required>
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
                        <select name="sedeOpera" value={formData.sedeOpera}
                            onChange={handleChange} required>
                            <option value="" disabled hidden>Select Branch</option>
                            {sedes.map((sede) => (
                                <option key={sede.id} value={sede.id}>
                                    {sede.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="button-row">
                    <button type="submit" className="save-btn">Save</button>
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