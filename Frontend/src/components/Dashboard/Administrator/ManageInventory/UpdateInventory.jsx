import { useState, useEffect } from "react";
import SearchDropdown from "../../../SearchDropdown/SearchDropdown";

function UpdateInventory({ onProducto }) {
    const [formData, setFormData] = useState({
        codigoProducto: "",
        nombre: "",
        idCategoria: "",
        costo: "",
        valorVenta: "",
    });

    const [categorias, setCategorias] = useState([]);
    const [categoriaText, setCategoriaText] = useState("");

    const categoriasFormateadas = categorias.map(c => ({
        id: c.id,
        label: c.categoria
    }));

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // Cargar categorias
    const loadCategorias = async () => {
        try {
            const res = await fetch("http://localhost:8000/productos/categorias/listar");
            const data = await res.json();
            setCategorias(data);
        } catch (err) {
            console.error("Error loading categories", err);
        }
    };

    useEffect(() => {
        loadCategorias();
    }, []);

    /* Crear Categoria */
    const handleCreateCategoria = async (nombreNueva) => {
        try {
            const response = await fetch("http://localhost:8000/productos/categorias/crear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoria: nombreNueva }),
            });

            const result = await response.json();

            if (result.status === "OK") {
                await loadCategorias();
                setSuccess("Category created correctly");
                const nueva = categorias.find(c => c.categoria === nombreNueva);
                setFormData((prev) => ({
                    ...prev,
                    idCategoria: nueva?.id || ""
                }));
            } else {
                setError(result.reason || "Error creating category");
            }
        } catch (err) {
            setError("Error creating categorys");
        }
    };

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
                        idCategoria: data.idCategoria || "",
                        costo: data.costo || "",
                        valorVenta: data.valorVenta || ""
                    }));
                    setCategoriaText(data.categoria);
                    setError("");
                } else {
                    setError("No product with that code and branch");
                    setFormData((prev) => ({
                        ...prev,
                        nombre: "",
                        idCategoria: "",
                        costo: "",
                        valorVenta: ""
                    }));
                    setCategoriaText("");
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

        console.log(formData);

        if (!formData.idCategoria) {
            setError("Please select a category");
            return;
        }

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
                    idCategoria: formData.idCategoria || null,
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
                    idCategoria: "",
                    costo: "",
                    valorVenta: "",
                });
                setCategoriaText("");
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
            idCategoria: "",
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
                        <SearchDropdown
                            valueText={categoriaText}
                            setValueText={setCategoriaText}
                            data={categoriasFormateadas}
                            placeholder="Search or create category"
                            allowCreate={true}
                            onSelect={(item) => {
                                setCategoriaText(item.label);
                                setFormData((prev) => ({ ...prev, idCategoria: item.id }));
                            }}
                            onCreate={async (nombreCat) => {
                                await handleCreateCategoria(nombreCat);
                            }}
                        />
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