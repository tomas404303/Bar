import { useState, useEffect } from "react";

function AddInventory({ onProducto }) {
    const [formData, setFormData] = useState({
        nombreProducto: "",
        categoria: "",
        costo: "",
        precioVenta: "",
    });

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");

        if (parseInt(formData.precioVenta) < parseInt(formData.costo)) {
            setError("The sale price cannot be lower than the cost price.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/productos/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nombreProducto: formData.nombreProducto,
                    categoria: formData.categoria,
                    costo: parseInt(formData.costo),
                    precioVenta: parseInt(formData.precioVenta),
                }),
            });

            const result = await response.json();

            if (result.status === "OK") {
                setSuccess("Product created correctly");
                setFormData({
                    nombreProducto: "",
                    categoria: "",
                    costo: "",
                    precioVenta: "",
                });

                onProducto();
            } else {
                setError("Error creating product");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleClean = () => {
        setFormData({
            nombreProducto: "",
            categoria: "",
            costo: "",
            precioVenta: "",
        })
    }

    const handleCloseModal = () => {
        setSuccess("");
        setError("");
    };

    const customStyles = {
    menuList: (base) => ({
      ...base,
      maxHeight: 150,
      overflowY: "auto",
    }),
  };

    return (
        <section className="section">
            <h2 className="title">Add Product</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div>
                        <label>Name</label>
                        <input type="text" name="nombreProducto" value={formData.nombreProducto}
                            onChange={handleChange} required />
                    </div>
                </div>
                <div className="form-row">
                    <div>
                        <label>Category</label>
                        <input type="text" name="categoria" value={formData.categoria}
                            onChange={handleChange} required />
                    </div>
                </div>
                <div className="form-row">
                    <div>
                        <label>Cost</label>
                        <input type="number" name="costo" value={formData.costo}
                            onChange={handleChange} min="1" step="1" required />
                    </div>
                    <div>
                        <label>Sale Price</label>
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

export default AddInventory