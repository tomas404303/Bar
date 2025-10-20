import NavBar from "../../../Layout/NavBar";
import ActivateTable from "./ActivateTable";
import DeactivateTable from "./DeactivateTable";
import { useState, useEffect } from "react";

function ManageTables() {
    const usuario = localStorage.getItem("usuario");
    const [activateTab, setActivateTab] = useState("activate");
    const [mesas, setMesas] = useState([]);

    const fetchData = async () => {
        try {
            const [resMesas] = await Promise.all([
                fetch("http://localhost:8000/mesas/cantidadmesas")
            ]);

            const dataMesas = await resMesas.json();

            if (dataMesas === "F") {
                setMesas([]);
            } else {
                setMesas(dataMesas);
            }
            
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleMesa = () => {
        fetchData();
    };

    return (
        <div className="dashboardMain">
            <NavBar usuario={usuario} />
            <div className="manage">
                <section className="section">
                    <h2 className="title">Number of Tables by Branch</h2>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Branches</th>
                                    <th>Number of Tables</th>
                                    <th>Status Branch</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mesas.map((mesa) => (
                                    <tr key={mesa.id}>
                                        <td>{mesa.nombre}</td>
                                        <td>{mesa.cantidad}</td>
                                        <td><span className={`status ${mesa.estado === true ? "active" : "suspended"}`}>
                                            {mesa.estado === true ? "Active" : "Suspended"}
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
                            className={`tab-btn ${activateTab === "activate" ? "active" : ""}`}
                            onClick={() => setActivateTab("activate")}> Increase Tables
                        </button>
                        <button
                            className={`tab-btn ${activateTab === "deactivate" ? "active" : ""}`}
                            onClick={() => setActivateTab("deactivate")}> Reduce Tables
                        </button>
                    </div>
                </section>
                
                <section>
                    <div className="tab-content">
                        {activateTab === "activate" ? <ActivateTable onMesa={handleMesa} /> : <DeactivateTable onMesa={handleMesa} />}
                    </div>
                </section>
            </div>
        </div>
    )
}

export default ManageTables;