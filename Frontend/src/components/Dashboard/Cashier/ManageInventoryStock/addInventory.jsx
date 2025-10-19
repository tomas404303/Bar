import { useState, useEffect } from "react";

function AddStock({ onProducto }) {
    const usuario = localStorage.getItem("usuario");
    const cargo = localStorage.getItem("cargo");
    const sedeUsuario = localStorage.getItem("sede");

    const [formData, setFormData] = useState({
        codigoProducto: "",
        sede: cargo === "Administrator" ? "" : sedeUsuario,
        cantidad: ""
    });

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [sedes, setSedes] = useState([]);

    useEffect(() => {
        if (cargo === "Administrator") {
            const fetchSedes = async () => {
                try {
                    const res = await fetch("http://localhost:8000/inventario/sedes");
                    const data = await res.json();
                    setSedes(data);
                } catch (err) {
                    console.error("Error loading branches:", err);
                }
            };
            fetchSedes();
        }
    }, [cargo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

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
            setError("Please enter a product code and select a branch");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/inventario/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idSucursal: parseInt(formData.sede),
                    idProducto: formData.codigoProducto,
                    cantidad: cantidadNum
                }),
            });

            const data = await response.json();

            if (data.status === "OK") {
                setSuccess(`Inventory updated successfully (${data.accion})`);
                setFormData({
                    codigoProducto: "",
                    sede: cargo === "Administrator" ? "" : sedeUsuario,
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
        setFormData({
            codigoProducto: "",
            sede: cargo === "Administrator" ? "" : sedeUsuario,
            cantidad: ""
        });
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
                    <div>
                        <label>Product Code</label>
                        <input
                            type="text"
                            name="codigoProducto"
                            value={formData.codigoProducto}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="form-row">
                    {cargo === "Administrator" ? (
                        <div>
                            <label>Branch</label>
                            <select
                                name="sede"
                                value={formData.sede}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled hidden>Select Branch</option>
                                {sedes.map((s) => (
                                    <option key={s.id} value={s.id}>{s.nombre}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label>Branch</label>
                            <input
                                type="text"
                                value={sedeUsuario}
                                disabled
                            />
                        </div>
                    )}
                    <div>
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
                </div>
                <div className="button-row">
                    <button type="submit" className="save-btn">Save</button>
                    <button type="button" className="cancel-btn" onClick={handleClean}>Cancel</button>
                </div>
            </form>

            {success && (
                <div className="modal-success">
                    <div className="modal-content">
                        <p>{success}</p>
                        <button onClick={handleCloseModal}>OK</button>
                    </div>
                </div>
            )}

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
