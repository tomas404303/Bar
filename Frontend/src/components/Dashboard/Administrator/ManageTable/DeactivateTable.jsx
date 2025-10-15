import { useState, useEffect } from "react";

function DeactivateTable({onMesa}) {
    const [formData, setFormData] = useState({
        cantidad: "",
        sucursales: "",
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");

        try {
            const response = await fetch("http://localhost:8000/mesas/actualizarmesas", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    numero:  parseInt(formData.cantidad),
                    sede: formData.sucursales,
                }),
            });

            const result = await response.json();

            if (result.status === "OK") {
                setSuccess("Number of tables updated correctly");
                setFormData({
                    cantidad: "",
                    sucursales: "",
                });

                onMesa();
            } else {
                setError("Error updating number of tables");
                handleClean();
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleClean = () => {
        setFormData({
            cantidad: "",
            sucursales: "",
        })
    }

    const handleCloseModal = () => {
        setSuccess("");
        setError("");
    };

    return (
        <section className="section">
            <h2 className="title">Reduce Number of Tables per Branch</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div>
                        <label>Branch</label>
                        <select name="sucursales" value={formData.sucursales}
                            onChange={handleChange} required>
                            <option value="" disabled hidden>Select Branch</option>
                            {sedes.map((sede) => (
                                <option key={sede.id} value={sede.id}>
                                    {sede.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Number of Tables</label>
                        <input type="number" name="cantidad" value={formData.cantidad}
                            onChange={handleChange} min="1" step="1" required/>
                    </div>
                </div>
                <div className="form-row">
                    <div className="button-row">
                        <button type="submit" className="save-btn">Save Changes</button>
                        <button type="button" className="cancel-btn" onClick={handleClean}>Cancel</button>
                    </div>
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

export default DeactivateTable