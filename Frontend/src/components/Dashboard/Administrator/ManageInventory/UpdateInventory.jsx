import { useState, useEffect } from "react";

function UpdateInventory({ onProducto }) {
    const [formData, setFormData] = useState({
        codigoProducto: "",
        nombre: "",
        categoria: "",
        costo: "",
        valorVenta: "",
    });

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleBlur = async () => {
        if (formData.codigoProducto) {
            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/productos/${formData.codigoProducto}`);
                if (!response.ok) throw new Error("Error in the request");

                const data = await response.json();

                if (data !== "F") {
                    setFormData((prev) => ({
                        ...prev,
                        nombre: data.nombre || "",
                        categoria: data.categoria || "",
                        costo: data.costo || "",
                        valorVenta: data.valorVenta || ""
                    }));
                    setError("");
                } else {
                    setError("No product with that code and branch");
                    setFormData((prev) => ({
                        ...prev,
                        nombre: "",
                        categoria: "",
                        costo: "",
                        valorVenta: ""
                    }));
                }
            } catch (error) {
                console.error("Error getting product:", error);
                setError("Connection error while getting product");
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

        if (parseFloat(formData.valorVenta) < parseFloat(formData.costo)) {
            setError("Sale price must be greater than or equal to cost");
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/productos/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: parseInt(formData.codigoProducto),
                    nombre: formData.nombre || null,
                    categoria: formData.categoria || null,
                    costo: formData.costo ? parseFloat(formData.costo) : null,
                    valorVenta: formData.valorVenta ? parseFloat(formData.valorVenta) : null
                }),
            });

            const result = await response.json();

            if (result.status === "OK") {
                setSuccess("Product updated successfully");
                setFormData({
                    codigoProducto: "",
                    nombre: "",
                    categoria: "",
                    costo: "",
                    valorVenta: "",
                });
                onProducto();
            } else {
                setError("Error updating product or ID not found");
            }
        } catch (error) {
            console.error("Error in the request:", error);
            setError("Connection error while updating product");
        }
    };


    const handleClean = () => {
        setFormData({
            codigoProducto: "",
            nombre: "",
            categoria: "",
            costo: "",
            valorVenta: "",
        });
    };

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
                        <input type="text" name="codigoProducto" value={formData.codigoProducto || ""}
                            onChange={handleChange} onBlur={handleBlur} required />
                    </div>
                </div>
                <div className="form-row">
                    <div>
                        <label>Name</label>
                        <input type="text" name="nombre" value={formData.nombre || ""}
                            onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Category</label>
                        <input type="text" name="categoria" value={formData.categoria || ""}
                            onChange={handleChange} required />
                    </div>
                </div>
                <div className="form-row">
                    <div>
                        <label>Cost</label>
                        <input type="number" name="costo" value={formData.costo || ""}
                            onChange={handleChange} min="1" step="1" required />
                    </div>
                    <div>
                        <label>Sale price</label>
                        <input type="number" name="valorVenta" value={formData.valorVenta || ""}
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