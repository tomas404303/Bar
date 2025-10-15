import { useState, useEffect } from "react";
import Select from "react-select";

function AddInventory({ onProducto }) {
    const [formData, setFormData] = useState({
        codigoProducto: "",
        nombreProducto: "",
        categoria: "",
        costo: "",
        precioVenta: "",
        sede: "",
    });

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");

        try {
            const response = await fetch("http://localhost:8000/productos/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    codigoProducto: formData.codigoProducto,
                    nombreProducto: formData.nombreProducto,
                    sede: parseInt(formData.sede),
                    categoria: formData.categoria,
                    costo: parseInt(formData.costo),
                    precioVenta: parseInt(formData.precioVenta),
                    estado: 1,
                }),
            });

            const result = await response.json();

            if (result.status === "OK") {
                setSuccess("Product created correctly");
                setFormData({
                    codigoProducto: "",
                    nombreProducto: "",
                    categoria: "",
                    costo: "",
                    precioVenta: "",
                    sede: "",
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
            codigoProducto: "",
            nombreProducto: "",
            categoria: "",
            costo: "",
            precioVenta: "",
            sede: "",
        })
    }

    const handleCloseModal = () => {
        setSuccess("");
        setError("");
    };

    const options = sedes.map((sede) => ({
        value: sede.id,
        label: sede.nombre,
    }));

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
                        <label>Code</label>
                        <input type="text" pattern="^[A-Za-z0-9]{4}$"
                            title="Enter 4 characters: letters or numbers, no spaces."
                            name="codigoProducto" value={formData.codigoProducto} onChange={handleChange} required />
                    </div>
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
                    <div>
                        <label>Branch</label>
                        <select name="sede" value={formData.sede}
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