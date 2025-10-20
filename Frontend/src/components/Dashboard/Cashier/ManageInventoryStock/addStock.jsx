import NavBar from "../../../Layout/NavBar";
import AddInventory from "./addInventory";
import { useState, useEffect } from "react";

function ManageInventory() {
    const usuario = localStorage.getItem("usuario");
    const cargo = localStorage.getItem("cargo");
    const sede = localStorage.getItem("sede");
    const [showForm, setShowForm] = useState(true);
    const [inventario, setInventario] = useState([]);

    const fetchData = async () => {
        try {
            // Enviamos cargo y sede como query params
            const res = await fetch(`http://localhost:8000/inventario/?cargo=${cargo}&sede=${sede}`);
            const data = await res.json();
            setInventario(data);
        } catch (error) {
            console.error("Error loading inventory data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="dashboardMain">
            <NavBar usuario={usuario} />
            <div className="manage">
                <section className="section">
                    <h2 className="title">Inventory</h2>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Name</th>
                                    <th>Branch</th>
                                    <th>Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(inventario) && inventario.length > 0 ? (
                                    inventario.map((item) => (
                                        <tr key={`${item.idProducto}-${item.idSucursal}`}>
                                            <td>{item.idProducto}</td>
                                            <td>{item.nombre}</td>
                                            <td>{item.sede}</td>
                                            <td>{item.cantidad}</td>
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
                    <div className="button-row">
                        <button
                            className="tab-btn active"
                            onClick={() => setShowForm(true)}
                        >
                            Add Stock
                        </button>
                    </div>
                </section>

                <section>
                    {showForm && <AddInventory onProducto={fetchData} />}
                </section>
            </div>
        </div>
    );
}

export default ManageInventory;
