import { useState, useEffect  } from "react";

function AddStock({ onProducto }) {
    const usuario = localStorage.getItem("usuario");
    const cargo = localStorage.getItem("cargo");
    const sedeUsuario = localStorage.getItem("sede");
    const [sedes, setSedes] = useState([]); 

    const [formData, setFormData] = useState({
        codigoProducto: "",
        sede: sedeUsuario,
        cantidad: ""
    });

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    useEffect(() => {
        async function fetchSedes() {
            try {
                const res = await fetch(`http://localhost:8000/inventario/sedes?cargo=${cargo}&sede=${sedeUsuario}`);
                const data = await res.json();
                setSedes(data);
            } catch (err) {
                console.error(err);
            }
        }
        fetchSedes();
    }, [cargo, sedeUsuario]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");

        const cantidadNum = parseInt(formData.cantidad, 10);
        if (isNaN(cantidadNum) || cantidadNum <= 0) {
            setError("Quantity must be a positive number");
            return;
        }

        if (!formData.codigoProducto || !formData.sede) {
            setError("Please enter a product code and branch");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/inventario/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idSucursal: formData.sede,
                    idProducto: formData.codigoProducto,
                    cantidad: cantidadNum
                }),
            });

            const data = await response.json();

            if (data.status === "OK") {
                setSuccess(`Inventory updated successfully`);
                setFormData({
                    codigoProducto: "",
                    sede: sedeUsuario,
                    cantidad: ""
                });
                if (onProducto) onProducto();
            } else {
                setError(data.reason || data.error || "Error updating inventory");
            }
        } catch (err) {
            console.error(err);
            setError("Connection error while updating inventory");
        }
    };

    const handleClean = () => {
        setFormData({ codigoProducto: "", sede: sedeUsuario, cantidad: "" });
        setError(""); 
        setSuccess("");
    };

    const handleCloseModal = () => {
        setError(""); 
        setSuccess("");
    };

    return (
        <section className="section">
            <h2 className="title">Add Stock</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <label>Product Code</label>
                    <input
                        type="text"
                        name="codigoProducto"
                        value={formData.codigoProducto}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-row">
                    <label>Branch</label>
                    {cargo === "Administrator" ? (
                        <select name="sede" value={formData.sede} onChange={handleChange} required>
                            <option value="">Select a branch</option>
                            {sedes.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre}</option>
                            ))}
                        </select>
                    ) : (
                        <input type="text" value={formData.sede} disabled />
                    )}
                </div>
                <div className="form-row">
                    <label>Quantity</label>
                    <input
                        type="number"
                        name="cantidad"
                        value={formData.cantidad}
                        onChange={handleChange}
                        min="1"
                        required
                    />
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

            {/* Modal de Error */}
            {error && (
                <div className="modal-error">
                    <div className="modal-content">
                        <p>{error}</p>
                        <button onClick={handleCloseModal}>OK</button>
                    </div>
                </div>
            )}
        </section>
    );
}

export default AddStock;
