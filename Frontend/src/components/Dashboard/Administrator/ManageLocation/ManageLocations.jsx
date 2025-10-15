import NavBar from "../../../Layout/NavBar";
import AddLocation from "./AddLocation";
import UpdateLocation from "./UpdateLocation";
import { useState, useEffect } from "react";

function ManageLocations() {
    const usuario = localStorage.getItem("usuario");
    const [activateTab, setActivateTab] = useState("add");
    const [sedes, setSedes] = useState([]);

    const fetchData = async () => {
        try {
            const [resSedes] = await Promise.all([
                fetch("http://localhost:8000/sedes/")
            ]);

            const dataSedes = await resSedes.json();

            setSedes(dataSedes);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSede = () => {
        fetchData();
    };

    return (
        <div className="dashboardMain">
            <NavBar usuario={usuario}/>
            <div className="manage"> 
                <section className="section">
                    <h2 className="title">Branches List</h2>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Address</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sedes.map((sede) => (
                                    <tr key={sede.id}>
                                        <td>{sede.nombre}</td>
                                        <td>{sede.direccion}</td>
                                        <td><span className={`status ${sede.estado === true ? "active" : "suspended"}`}>
                                            {sede.estado === true ? "Active" : "Suspended"}
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
                            onClick={() => setActivateTab("add")}> Add Location
                        </button>
                        <button
                            className={`tab-btn ${activateTab === "update" ? "active" : ""}`}
                            onClick={() => setActivateTab("update")}> Update Location
                        </button>
                    </div>
                </section>
                <section>
                    <div className="tab-content">
                        {activateTab === "add" ? <AddLocation onSede={handleSede}/> : <UpdateLocation onSede={handleSede}/>}
                    </div>
                </section>
            </div>
        </div>
    )
}

export default ManageLocations;