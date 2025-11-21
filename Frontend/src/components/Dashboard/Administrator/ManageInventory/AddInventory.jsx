import { useState, useEffect } from "react";
import SearchDropdown from "../../../SearchDropdown/SearchDropdown";


function AddInventory({ onProducto }) {
    const [formData, setFormData] = useState({
        nombreProducto: "",
        idcategoria: "",
        costo: "",
        precioVenta: "",
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSuccess("");
        setError("");

        if (!formData.idCategoria) {
            setError("Please select a category");
            return;
        }

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
                    idCategoria: formData.idCategoria,
                    costo: parseInt(formData.costo),
                    precioVenta: parseInt(formData.precioVenta),
                }),
            });

            const result = await response.json();

            if (result.status === "OK") {
                setSuccess("Product created correctly");
                setFormData({
                    nombreProducto: "",
                    idCategoria: "",
                    costo: "",
                    precioVenta: "",
                });
                setCategoriaText("");

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
            idcategoria: "",
            costo: "",
            precioVenta: "",
        })
        setCategoriaText("");
    }

    const handleCloseModal = () => {
        setSuccess("");
        setError("");
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