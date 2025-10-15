import { useState, useEffect } from "react";

function UpdateLocation({onSede}) {
    const [formData, setFormData] = useState({
        branch: "",
        estado: "",
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
                console.error("Error loading data:", error);
            }
        };

        fetchData();
    }, []);

    // Buscar sede cuando se sale del campo ID
    const handleBlur = async () => {
        if (!formData.branch) return;

        try {
            const res = await fetch(`http://127.0.0.1:8000/sedes/${formData.branch}`);
            const data = await res.json();

            if (data !== "F") {
                //  Llenar los campos con los valores devueltos
                setFormData({
                    ...formData,
                    estado: data.estado?.toString() || "",
                });
            } else {
                setError("No branch was found with that name");
            }
        } catch (error) {
            console.error("Error getting branch:", error);
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

        const estadoValue = formData.estado === true || formData.estado === "true" ? 1 : 0;

        try {
            const response = await fetch(`http://127.0.0.1:8000/sedes/${formData.branch}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    estado: estadoValue,
                }),
            });

            const result = await response.json();

            if (result.status === "OK") {
                setSuccess("Branch updated correctly");
                setFormData({
                    branch: "",
                    estado: "",
                });

                onSede();
            } else {
                setError("Error updating branch");
            }
        } catch (error) {
            console.error("Error in the request:", error);
        }
    };

    const handleClean = () => {
        setFormData({
            branch: "",
            estado: "",
        })
    }

    const handleCloseModal = () => {
        setSuccess("");
        setError("");
    };

    return (
        <section className="section">
            <h2 className="title">Change Status</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div>
                        <label>Branch</label>
                        <select name="branch" value={formData.branch} onChange={handleChange} onBlur={handleBlur} required>
                            <option value="" disabled selected hidden>Select Branch</option>
                            {sedes.map((sede) => (
                                <option key={sede.id} value={sede.nombre}>
                                    {sede.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Status</label>
                        <select name="estado" value={formData.estado} onChange={handleChange} required>
                            <option value="" disabled selected hidden>Select Status</option>
                            <option value={true}>Active</option>
                            <option value={false}>Suspended</option>
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

export default UpdateLocation