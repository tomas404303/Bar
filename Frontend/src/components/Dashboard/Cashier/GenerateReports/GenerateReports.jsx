import NavBar from "../../../Layout/NavBar";
import { useState, useEffect } from "react";

function GenerateReports() {
    const usuario = localStorage.getItem("usuario");

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleCloseModal = () => {
        setSuccess("");
        setError("");
    };

    return (
        <div className="dashboardMain">
            <NavBar usuario={usuario} />
            <div className="manage">
                <section className="section">
                    <h2 className="title">Generate Sales Report</h2>
                    <p>Remember: this report is based on the service start date, not on the sale completion date.</p>
                    <form className="form" >
                        <div className="form-row">
                            <div>
                                <label>Start Date</label>
                                <input type="text" name="nombreProducto" required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div>
                                <label>End Date</label>
                                <input type="text" name="nombreProducto" required />
                            </div>
                        </div>
                        <div className="button-row">
                            <button type="submit" className="save-btn">Generate Report</button>
                        </div>
                    </form>

                    {/* Modal de Success */}
                    {success && (
                        <div className="modal-success">
                            <div className="modal-content">
                                <p>{success}</p>
                                <button onClick={handleCloseModal}>OK</button>
                            </div>
                        </div>
                    )}
                    {/* Modal de error */}
                    {error && (
                        <div className="modal-error">
                            <div className="modal-content">
                                <p>{error}</p>
                                <button onClick={handleCloseModal} >OK</button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default GenerateReports;