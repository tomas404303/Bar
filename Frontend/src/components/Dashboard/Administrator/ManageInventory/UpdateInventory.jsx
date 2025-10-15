import { useState, useEffect } from "react";

function UpdateInventory({ onProducto }) {
    const [formData, setFormData] = useState({
        codigoProducto: "",
        sede: "",
        nombreProducto: "",
        estado: "",
        costo: "",
        precioVenta: "",
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

    const handleBlur = async () => {
        if (formData.codigoProducto && formData.sede) {
            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/productos/${formData.codigoProducto}/${formData.sede}`);
                if (!response.ok) throw new Error("Error in the request");

                const data = await response.json();

                if (data !== "F") {
                    setFormData((prev) => ({
                        ...prev,
                        nombreProducto: data.nombreProducto || "",
                        categoria: data.categoria || "",
                        costo: data.costo || "",
                        precioVenta: data.precioVenta || "",
                        estado: parseInt(data.estado) || 0,
                    }));
                } else {
                    setError("No product with that code and branch");
                }
            } catch (error) {
                console.error("Error getting product:", error);
            }
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");

        try {
            const response = await fetch(`http://127.0.0.1:8000/productos/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    codigoProducto: formData.codigoProducto,
                    sede: formData.sede,
                    nombreProducto: formData.nombreProducto,
                    estado: parseInt(formData.estado),
                    costo: formData.costo,
                    precioVenta: formData.precioVenta,
                }),
            });

            const result = await response.json();

            if (result.status === "OK") {
                setSuccess("Product updated correctly");
                setFormData({
                    codigoProducto: "",
                    sede: "",
                    nombreProducto: "",
                    estado: "",
                    costo: "",
                    precioVenta: "",
                });

                onProducto();
            } else {
                setError("Error updating product");
            }
        } catch (error) {
            console.error("Error in the request:", error);
        }
    };

    const handleClean = () => {
        setFormData({
            codigoProducto: "",
            sede: "",
            nombreProducto: "",
            estado: "",
            costo: "",
            precioVenta: "",
        })
    }

    const handleCloseModal = () => {
        setSuccess("");
        setError("");
    };

    return (
        <section className="section">
            <h2 className="title">Update Product</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div>
                        <label>Code</label>
                        <input type="text" name="codigoProducto" value={formData.codigoProducto}
                            onChange={handleChange} onBlur={handleBlur} required />
                    </div>
                    <div>
                        <label>Branch</label>
                        <select name="sede" value={formData.sede} onChange={handleChange} onBlur={handleBlur} required>
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
                        <label>Name</label>
                        <input type="text" name="nombreProducto" value={formData.nombreProducto}
                            onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Status</label>
                        <select name="estado" value={formData.estado} onChange={handleChange} required>
                            <option value="" disabled hidden>Select Status</option>
                            <option value={1}>Active</option>
                            <option value={0}>Suspended</option>
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div>
                        <label>Cost</label>
                        <input type="number" name="costo" value={formData.costo}
                            onChange={handleChange} min="1" step="1" required />
                    </div>
                    <div>
                        <label>Sale price</label>
                        <input type="number" name="precioVenta" value={formData.precioVenta}
                            onChange={handleChange} min="1" step="1" required />
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

export default UpdateInventory