import NavBar from "../../../Layout/NavBar";
import AddUser from "./AddUser";
import UpdateUser from "./UpdateUser";
import { useState } from "react";
import "./ManageUser.css";

function ManageUsers() {
    const usuario = localStorage.getItem("usuario");
    const [activateTab, setActivateTab] = useState("add");
    return (
        <div className="dashboardMain">
            <NavBar usuario={usuario} />

            <div className="manage">
                <section className="section">
                    <h2 className="title">User List</h2>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Full Name</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Branch</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>CC-1231231231</td>
                                    <td>German Medina</td>
                                    <td>jef_Ari</td>
                                    <td>Admin</td>
                                    <td>La 93</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>PPT-3232323232</td>
                                    <td>Daniel Tom</td>
                                    <td>Tom_Riv</td>
                                    <td>Cashier</td>
                                    <td>La 93</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>CC-1231231231</td>
                                    <td>Williams Dell</td>
                                    <td>Joh_Avi</td>
                                    <td>Waiter</td>
                                    <td>La 93</td>
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
                            onClick={() => setActivateTab("add")}> Add User
                        </button>
                        <button
                            className={`tab-btn ${activateTab === "update" ? "active" : ""}`}
                            onClick={() => setActivateTab("update")}> Update User
                        </button>
                    </div>
                </section>
                <section>
                    <div className="tab-content">
                        {activateTab === "add" ? <AddUser /> : <UpdateUser />}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default ManageUsers;