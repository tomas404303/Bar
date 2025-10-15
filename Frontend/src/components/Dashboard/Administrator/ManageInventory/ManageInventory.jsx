import NavBar from "../../../Layout/NavBar";
import AddInventory from "./AddInventory";
import UpdateInventory from "./UpdateInventory";
import { useState, useEffect } from "react";

function ManageInventory() {
    const usuario = localStorage.getItem("usuario");
    const [activateTab, setActivateTab] = useState("add");
    const [productos, setProductos] = useState([]);

    const fetchData = async () => {
        try {
            const [resProductos] = await Promise.all([
                fetch("http://localhost:8000/productos/")
            ]);

            const dataProductos = await resProductos.json();

            setProductos(dataProductos);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleProducto = () => {
        fetchData();
    };

    return (
        <div className="dashboardMain">
            <NavBar usuario={usuario} />
            <div className="manage">
                <section className="section">
                    <h2 className="title">Product List</h2>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Cost</th>
                                    <th>Sale Price</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map((producto) => (
                                    <tr key={producto.id}>
                                        <td>{producto.nombreProducto}</td>
                                        <td>{producto.categoria}</td>
                                        <td>$ {producto.costo}</td>
                                        <td>$ {producto.precioVenta}</td>
                                        <td><span className={`status ${producto.estado === 1 ? "active" : "suspended"}`}>
                                            {producto.estado === 1 ? "Active" : "Suspended"}
                                        </span></td>
                                    </tr>
                                ))}
                                
                            </tbody>
                        </table>
                    </div>
                </section>
                <section className="section">
                    <div className="button-row">
                        <button
                            className={`tab-btn ${activateTab === "add" ? "active" : ""}`}
                            onClick={() => setActivateTab("add")}> Add Product
                        </button>
                        <button
                            className={`tab-btn ${activateTab === "update" ? "active" : ""}`}
                            onClick={() => setActivateTab("update")}> Update Product
                        </button>
                    </div>
                </section>
                <section>
                    <div className="tab-content">
                        {activateTab === "add" ? <AddInventory onProducto={handleProducto}/> : <UpdateInventory onProducto={handleProducto}/>}
                    </div>
                </section>
            </div>
        </div>
    )
}

export default ManageInventory;