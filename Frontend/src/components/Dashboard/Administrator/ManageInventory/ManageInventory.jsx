import NavBar from "../../../Layout/NavBar";
import AddInventory from "./AddInventory";
import UpdateInventory from "./UpdateInventory";
import { useState } from "react";

function ManageInventory() {
    const usuario = localStorage.getItem("usuario");
    const [activateTab, setActivateTab] = useState("add");
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
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Cost</th>
                                    <th>Sale Price</th>
                                    <th>Quantity</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Jack Daniel's Old No.7</td>
                                    <td>Whiskies</td>
                                    <td>$ 80.000</td>
                                    <td>$ 180.000</td>
                                    <td>13</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>Ron Zacapa 23</td>
                                    <td>Rums</td>
                                    <td>$ 360.000</td>
                                    <td>$ 460.000</td>
                                    <td>8</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>Chivas Regal 12</td>
                                    <td>Whiskies</td>
                                    <td>$ 100.000</td>
                                    <td>$ 180.000</td>
                                    <td>0</td>
                                    <td><span className="status suspended">Suspended</span></td>
                                </tr>
                                <tr>
                                    <td>Absolut Vodka</td>
                                    <td>Vodkas</td>
                                    <td>$ 70.000</td>
                                    <td>$ 150.000</td>
                                    <td>21</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>Tequila Don Julio Blanco</td>
                                    <td>Tequilas</td>
                                    <td>$ 130.000</td>
                                    <td>$ 250.000</td>
                                    <td>9</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>Baileys Original Irish Cream</td>
                                    <td>Licores dulces</td>
                                    <td>$ 85.000</td>
                                    <td>$ 160.000</td>
                                    <td>6</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>Bombay Sapphire</td>
                                    <td>Gins</td>
                                    <td>$ 120.000</td>
                                    <td>$ 220.000</td>
                                    <td>4</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>Smirnoff Vodka Red</td>
                                    <td>Vodkas</td>
                                    <td>$ 55.000</td>
                                    <td>$ 120.000</td>
                                    <td>0</td>
                                    <td><span className="status suspended">Suspended</span></td>
                                </tr>
                                <tr>
                                    <td>Johnnie Walker Black Label</td>
                                    <td>Whiskies</td>
                                    <td>$ 110.000</td>
                                    <td>$ 200.000</td>
                                    <td>10</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>Havana Club Añejo 7 Años</td>
                                    <td>Rums</td>
                                    <td>$ 90.000</td>
                                    <td>$ 160.000</td>
                                    <td>5</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>Patrón Silver</td>
                                    <td>Tequilas</td>
                                    <td>$ 220.000</td>
                                    <td>$ 320.000</td>
                                    <td>3</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>Jägermeister</td>
                                    <td>Licores herbales</td>
                                    <td>$ 95.000</td>
                                    <td>$ 180.000</td>
                                    <td>2</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>Campari</td>
                                    <td>Aperitivos</td>
                                    <td>$ 80.000</td>
                                    <td>$ 140.000</td>
                                    <td>12</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>Tanqueray London Dry Gin</td>
                                    <td>Gins</td>
                                    <td>$ 100.000</td>
                                    <td>$ 190.000</td>
                                    <td>0</td>
                                    <td><span className="status suspended">Suspended</span></td>
                                </tr>
                                <tr>
                                    <td>Grey Goose Vodka</td>
                                    <td>Vodkas</td>
                                    <td>$ 220.000</td>
                                    <td>$ 350.000</td>
                                    <td>7</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
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
                        {activateTab === "add" ? <AddInventory /> : <UpdateInventory />}
                    </div>
                </section>
            </div>
        </div>
    )
}

export default ManageInventory;