import { useState, useEffect } from "react";

function AddStock({ onProducto }) {


    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [sedes, setSedes] = useState([]);

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

    return (
        <section className="section">
            <h2 className="title">Add Stock</h2>
            <form className="form">
                <div className="form-row">
                    <div>
                        <label>Code</label>
                        <input type="text" pattern="^[A-Za-z0-9]{4}$"
                            title="Enter 4 characters: letters or numbers, no spaces."
                            name="codigoProducto" required />
                    </div>
                </div>
                <div className="form-row">
                    <div>
                        <label>Branch</label>
                        <select name="sede"  required>
                            <option value="" disabled hidden>Select Branch</option>
                            {sedes.map((sede) => (
                                <option key={sede.id} value={sede.id}>
                                    {sede.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Cantidad</label>
                        <input type="text" name="categoria" required />
                    </div>
                </div>

                <div className="button-row">
                    <button type="submit" className="save-btn">Save</button>
                    <button type="button" className="cancel-btn">Cancel</button>
                </div>
            </form>
        </section>
    )
}

export default AddStock