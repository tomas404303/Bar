import NavBar from "../../../Layout/NavBar";
import AddUser from "./AddUser";
import UpdateUser from "./UpdateUser";
import { useState, useEffect } from "react";
import "./ManageUser.css";

function ManageUsers() {
    const usuario = localStorage.getItem("usuario");
    const [activateTab, setActivateTab] = useState("add");
    const [usuarios, setUsuarios] = useState([]);

    const fetchData = async () => {
        try {
            const [resUsuarios] = await Promise.all([
                fetch("http://localhost:8000/usuarios/")
            ]);

            const dataUsuarios = await resUsuarios.json();

            setUsuarios(dataUsuarios);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUsuario = () => {
        fetchData();
    };

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
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>{usuario.tipoDocumento} - {usuario.nui}</td>
                                        <td>{usuario.nombres_apellidos}</td>
                                        <td>{usuario.usuario}</td>
                                        <td>{usuario.cargoDesempeña}</td>
                                        <td>{usuario.sedeOpera}</td>
                                        <td><span className={`status ${usuario.estadoUsuario === 1 ? "active" : "suspended"}`}>
                                            {usuario.estadoUsuario === 1 ? "Active" : "Suspended"}
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
                        {activateTab === "add" ? <AddUser onUsuario={handleUsuario}/> : <UpdateUser onUsuario={handleUsuario}/>}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default ManageUsers;