import NavBar from "../../../Layout/NavBar";
import SearchDropdown from "../../../SearchDropdown/SearchDropdown";
import { useState, useEffect } from "react";

function TakeTableOrder() {
    const usuario = localStorage.getItem("usuario");
    const cargo = localStorage.getItem("cargo");
    const sede = localStorage.getItem("sede");

    const [sedes, setSedes] = useState([]); 
    const [inventario, setInventario] = useState([]);

    const [categorias, setCategorias] = useState([]);
    const [categoriaText, setCategoriaText] = useState("");

    const [formData, setFormData] = useState({
        idcategoria: "",
        sede: sede
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
    };

    useEffect(() => {
        async function fetchSedes() {
            try {
                const res = await fetch(`http://localhost:8000/inventario/sedes?cargo=${cargo}&sede=${sede}`);
                const data = await res.json();
                setSedes(data);
            } catch (err) {
                console.error(err);
            }
        }
        fetchSedes();
    }, [cargo, sede]);

    const fetchData = async () => {
        try {
            const res = await fetch(`http://localhost:8000/pedido/productos/?cargo=${cargo}&sede=${sede}`);
            const data = await res.json();
            setInventario(data);
        } catch (error) {
            console.error("Error loading inventory data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const categoriasFormateadas = categorias.map(c => ({
        id: c.id,
        label: c.categoria
    }));

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

    return (
        <div className="dashboardMain">
            <NavBar usuario={usuario} />
            <div className="manage">
                <section className="section">
                    <h2 className="title">Select Table</h2>
                    <div className="row">
                        <label className="label">Branch:</label>
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
                    <div className="row">
                        <label className="label">Table Number:</label>
                        <select className="select"></select>
                    </div>
                    <div className="row status-row">
                        <label className="label">Table Status:</label>
                        <span className="status-pill">Occupied</span>
                    </div>
                </section>
                <section className="section">
                    <h2 className="title">Available Products</h2>
                    <div className="row">
                        <label className="label">Category:</label>
                        <SearchDropdown
                            valueText={categoriaText}
                            setValueText={setCategoriaText}
                            data={categoriasFormateadas}
                            placeholder="Search"
                            allowCreate={true}
                            onSelect={(item) => {
                                setCategoriaText(item.label);
                                setFormData((prev) => ({ ...prev, idCategoria: item.id }));
                            }}
                        />
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                {cargo === "Administrator" ? (
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Branch</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th colSpan={2}>Add</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th colSpan={2}>Add</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {Array.isArray(inventario) && inventario.length > 0 && cargo === "Administrator" ? (
                                    inventario.map((item) => (
                                        <tr key={`${item.idProducto}-${item.idSucursal}`}>
                                            <td>{item.nombre}</td>
                                            <td>{item.categoria}</td>
                                            <td>{item.sede}</td>
                                            <td>{item.cantidad}</td>
                                            <td>$ {item.valorVenta}</td>
                                        </tr>
                                    ))
                                ) : Array.isArray(inventario) && inventario.length > 0 && cargo === "Waiter" ? (
                                    inventario.map((item) => (
                                        <tr key={`${item.idProducto}-${item.idSucursal}`}>
                                            <td>{item.nombre}</td>
                                            <td>{item.categoria}</td>
                                            <td>{item.cantidad}</td>
                                            <td>$ {item.valorVenta}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4">No inventory records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
                <section className="section">
                    <h2 className="title">Order Preview</h2>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Rums</td>
                                    <td>1</td>
                                    <td>30.000</td>
                                    <td>30.000</td>
                                </tr>
                                <tr>
                                    <td>Rums</td>
                                    <td>1</td>
                                    <td>30.000</td>
                                    <td>30.000</td>
                                </tr>
                                <tr>
                                    <td>Rums</td>
                                    <td>1</td>
                                    <td>30.000</td>
                                    <td>30.000</td>
                                </tr>
                                <tr className="total-row">
                                    <td colSpan="2"></td>
                                    <td style={{fontWeight:'bold', color:'#0B5BAA'}}>Total</td>
                                    <td className="total-value">30.000</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="button-row" style={{marginTop:'40px'}}>
                        <button type="submit" className="save-btn">Confirm order</button>
                        <button type="button" className="cancel-btn" >Cancel</button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default TakeTableOrder;