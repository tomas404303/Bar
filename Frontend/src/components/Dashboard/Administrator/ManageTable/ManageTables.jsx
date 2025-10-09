import NavBar from "../../../Layout/NavBar";
import ActivateTable from "./ActivateTable";
import DeactivateTable from "./DeactivateTable";
import { useState } from "react";

function ManageTables() {
    const usuario = localStorage.getItem("usuario");
    const [activateTab, setActivateTab] = useState("activate");
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
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Central Chapinero</td>
                                    <td>30</td>
                                </tr>
                                <tr>
                                    <td>Usaquén Norte</td>
                                    <td>18</td>
                                </tr>
                                <tr>
                                    <td>La 93</td>
                                    <td>27</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="section">
                    <div className="button-row">
                        <button
                            className={`tab-btn ${activateTab === "activate" ? "active" : ""}`}
                            onClick={() => setActivateTab("activate")}> Activate Tables
                        </button>
                        <button
                            className={`tab-btn ${activateTab === "deactivate" ? "active" : ""}`}
                            onClick={() => setActivateTab("deactivate")}> Deactivate Tables
                        </button>
                    </div>
                </section>
                <section>
                    <div className="tab-content">
                        {activateTab === "activate" ? <ActivateTable /> : <DeactivateTable />}
                    </div>
                </section>
            </div>
        </div>
    )
}

export default ManageTables;