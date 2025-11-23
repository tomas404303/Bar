import NavBar from "../../../Layout/NavBar";
import { useState, useEffect } from "react";

function GenerateReports() {
    const usuario = localStorage.getItem("usuario");
    const cargo = localStorage.getItem("cargo");
    const sede = localStorage.getItem("sede");

    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleCloseModal = () => {
        setSuccess("");
        setError("");
    };

    const handleGenerateReport = async (e) => {
        e.preventDefault();

        try {
            const params = new URLSearchParams({
                cargo: cargo,
                sede: sede
            });

            if (fechaInicio) params.append("fechaInicio", fechaInicio);
            if (fechaFin) params.append("fechaFin", fechaFin);

            const response = await fetch(`http://localhost:8000/reportes/ventas/exportar?${params}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error("Error generating report");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `reporte_ventas_${new Date().getTime()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setSuccess("Report generated and downloaded successfully");
            setFechaInicio("");
            setFechaFin("");
        } catch (err) {
            setError("Error generating report: " + err.message);
        }
    };

    return (
        <div className="dashboardMain">
            <NavBar usuario={usuario} />
            <div className="manage">
                <section className="section">
                    <h2 className="title">Generate Sales Report</h2>
                    <p>Remember: this report is based on the service start date, not on the sale completion date.</p>
                    <form className="form" onSubmit={handleGenerateReport}>
                        <div className="form-row">
                            <div>
                                <label>Start Date</label>
                                <input 
                                    type="date" 
                                    value={fechaInicio} 
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div>
                                <label>End Date</label>
                                <input 
                                    type="date" 
                                    value={fechaFin} 
                                    onChange={(e) => setFechaFin(e.target.value)}
                                />
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