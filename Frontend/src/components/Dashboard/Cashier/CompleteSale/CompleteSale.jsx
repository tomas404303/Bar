import NavBar from "../../../Layout/NavBar";

import React, { useState } from "react";

function CompleteSale() {
    const usuario = localStorage.getItem("usuario");
    const [paymentMethod, setPaymentMethod] = useState(null);

    return (
        <div className="dashboardMain">
            <NavBar usuario={usuario} />
            <div className="manage">
                <section className="section">
                    <h2 className="title">Confirm Orders</h2>
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
                                <tbody>

                                </tbody>
                            </thead>
                        </table>
                    </div>

                    <div className="payment-section">
                        <p className="pay-label">Select payment method</p>
                        <div className="payment-buttons">
                            {["Cash", "Debit card", "Credit card"].map((m) => (
                                <button 
                                    key={m}
                                    className={
                                        "tab-btn" + (paymentMethod === m ? " pay-btn-selected" : "")}
                                    onClick={() => setPaymentMethod(m)}
                                    type="button"
                                > {m}
                                </button>
                            ))}
                        </div>
                        <button className="confirm-btn">
                            Confirm payment
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default CompleteSale;