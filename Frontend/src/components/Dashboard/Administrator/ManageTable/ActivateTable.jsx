import { useState, useEffect } from "react";

function ActivateTable() {

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

    return (
        <section className="section">
            <h2 className="title">Activate Number of Tables per Branch</h2>
            <form className="form">
                <div className="form-row">
                    <div>
                        <label>Branch</label>
                        <select required>
                            <option value="" disabled selected hidden>Select Branch</option>
                            {sedes.map((sede) => (
                                <option key={sede.id} value={sede.id}>
                                    {sede.nombreSucursal}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Number of Tables</label>
                        <input type="number" min="1" step="1" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="button-row">
                        <button type="submit" className="save-btn">Save Changes</button>
                        <button type="button" className="cancel-btn">Cancel</button>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default ActivateTable