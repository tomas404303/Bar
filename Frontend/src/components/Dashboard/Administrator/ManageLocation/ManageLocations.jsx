import NavBar from "../../../Layout/NavBar";
import AddLocation from "./AddLocation";
import UpdateLocation from "./UpdateLocation";
import { useState } from "react";

function ManageLocations() {
    const usuario = localStorage.getItem("usuario");
    const [activateTab, setActivateTab] = useState("add");
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
                                    <th>Locations</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Central Chapinero</td>
                                    <td>Calle 75</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>Usaquén Norte</td>
                                    <td>Transversal 85</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>La 93</td>
                                    <td>Avenida Caracas</td>
                                    <td><span className="status suspended">Suspended</span></td>
                                </tr>
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
                        {activateTab === "add" ? <AddLocation /> : <UpdateLocation />}
                    </div>
                </section>
            </div>
        </div>
    )
}

export default ManageLocations;