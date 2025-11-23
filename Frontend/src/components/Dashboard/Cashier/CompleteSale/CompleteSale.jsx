import NavBar from "../../../Layout/NavBar";
import { useState, useEffect } from "react";

function CompleteSale() {
    const usuario = localStorage.getItem("usuario");
    const cargo = localStorage.getItem("cargo");
    const sede = localStorage.getItem("sede");

    const getInitialFormData = () => ({
        sede: cargo === "Administrator" ? "" : (sede || ""),
        mesa: ""
    });

    const [paymentMethod, setPaymentMethod] = useState(null);
    const [estadoMesa, setEstadoMesa] = useState(null);
    const [sedes, setSedes] = useState([]);
    const [mesasDisponibles, setMesasDisponibles] = useState([]);
    const [loadingMesas, setLoadingMesas] = useState(false);
    const [orderDetails, setOrderDetails] = useState([]);
    const [currentVentaId, setCurrentVentaId] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [feedbackType, setFeedbackType] = useState("");
    const [formData, setFormData] = useState(getInitialFormData());

    const resetCompleteSaleForm = () => {
        setFormData(getInitialFormData());
        setPaymentMethod(null);
        setOrderDetails([]);
        setCurrentVentaId(null);
        setEstadoMesa(null);
    };

    const handleCloseModal = () => {
        const wasSuccess = feedbackType === "success";
        setFeedback("");
        setFeedbackType("");
        if (wasSuccess) {
            resetCompleteSaleForm();
        }
    };

    useEffect(() => {
        const fetchSedes = async () => {
            try {
                const res = await fetch(`http://localhost:8000/inventario/sedes?cargo=${cargo}&sede=${sede}`);
                const data = await res.json();
                setSedes(data);
            } catch (err) {
                console.error("Error fetching sedes:", err);
            }
        };
        fetchSedes();
    }, [cargo, sede]);

    useEffect(() => {
        if (cargo !== "Administrator" && sedes.length > 0) {
            const match = sedes.find(s => s.nombre === sede);
            if (match) {
                setFormData(prev => ({ ...prev, sede: match.id }));
            }
        }
    }, [sedes, cargo, sede]);

    useEffect(() => {
        const sedeID = formData.sede;

        if (!sedeID || isNaN(Number(sedeID))) {
            setMesasDisponibles([]);
            return;
        }

        const fetchMesas = async () => {
            try {
                setLoadingMesas(true);
                const res = await fetch(`http://localhost:8000/pedido/mesas/${sedeID}`);
                const data = await res.json();
                if (data.mesas) {
                    const mesasArr = Array.from({ length: data.mesas }, (_, i) => i + 1);
                    setMesasDisponibles(mesasArr);
                } else {
                    setMesasDisponibles([]);
                }
            } catch (err) {
                console.error("Error loading tables:", err);
                setMesasDisponibles([]);
            } finally {
                setLoadingMesas(false);
            }
        };

        fetchMesas();
    }, [formData.sede]);

    useEffect(() => {
        const fetchEstadoMesa = async () => {
            if (!formData.sede || !formData.mesa) {
                setEstadoMesa(null);
                return;
            }
            try {
                const res = await fetch(`http://localhost:8000/pedido/estado-mesa/${formData.sede}/${formData.mesa}`);
                const data = await res.json();
                if (data.status === "OK") {
                    setEstadoMesa(data.estadoVenta);
                } else {
                    setEstadoMesa(null);
                }
            } catch (err) {
                setEstadoMesa(null);
            }
        };
        fetchEstadoMesa();
    }, [formData.sede, formData.mesa]);

    useEffect(() => {
        if (!formData.sede || !formData.mesa || estadoMesa !== 1) {
            setOrderDetails([]);
            return;
        }

        const controller = new AbortController();
        const fetchDetails = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8000/pedido/detalles/mesa?idSede=${formData.sede}&numeroMesa=${formData.mesa}`,
                    { signal: controller.signal }
                );
                const data = await res.json();
                if (data.status === "OK" && Array.isArray(data.detalles)) {
                    setOrderDetails(data.detalles);
                    setCurrentVentaId(data.idVenta || null);
                } else {
                    setOrderDetails([]);
                    setCurrentVentaId(null);
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setOrderDetails([]);
                }
            }
        };

        fetchDetails();
        return () => controller.abort();
    }, [formData.sede, formData.mesa, estadoMesa]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isTableSelected = Boolean(formData.sede && formData.mesa);
    const actionsDisabled = !isTableSelected || estadoMesa !== 1;
    const disabledButtonStyle = { backgroundColor: '#ccc', color: '#666', cursor: 'not-allowed' };
    const totalAmount = orderDetails.reduce((acc, item) => acc + Number(item.subTotal || 0), 0);
    const canConfirmPayment = !actionsDisabled && Boolean(paymentMethod && paymentMethod.id);
    const paymentOptions = [
        { id: 1, label: "Cash" },
        { id: 2, label: "Debit card" },
        { id: 3, label: "Credit card" }
    ];

    useEffect(() => {
        setFeedback("");
        setFeedbackType("");
    }, [formData.sede, formData.mesa]);

    const handleConfirmPayment = async () => {
        if (!canConfirmPayment || !currentVentaId) return;
        try {
            const query = new URLSearchParams({
                idVenta: currentVentaId,
                medioRecaudado: paymentMethod.id,
                total: totalAmount
            });
            const res = await fetch(`http://localhost:8000/pedido/cerrar?${query.toString()}`, {
                method: "POST"
            });
            const data = await res.json();
            if (data.status === "OK") {
                setFeedback("Sale closed successfully.");
                setFeedbackType("success");
                setEstadoMesa(0);
                setOrderDetails([]);
                setCurrentVentaId(null);
                setPaymentMethod(null);
            } else {
                throw new Error(data.error || "Unable to close sale");
            }
        } catch (err) {
            setFeedback(err.message || "Error closing sale.");
            setFeedbackType("error");
        }
    };

    return (
        <div className="dashboardMain">
            <NavBar usuario={usuario} />
            <div className="manage">
                <section className="section">
                    <h2 className="title">Confirm Orders</h2>

                    <div className="row">
                        <label className="label">Branch:</label>
                        {cargo === "Administrator" ? (
                            <select name="sede" value={formData.sede} onChange={handleChange} required>
                                <option value="">Select a branch</option>
                                {sedes.map(s => (
                                    <option key={s.id} value={s.id}>{s.nombre}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={sedes.find(s => s.id === formData.sede)?.nombre || ""}
                                disabled
                            />
                        )}
                    </div>

                    <div className="row">
                        <label className="label">Table Number:</label>
                        <select
                            name="mesa"
                            value={formData.mesa || ""}
                            onChange={handleChange}
                            disabled={!formData.sede || mesasDisponibles.length === 0}
                        >
                            <option value="">
                                {loadingMesas ? "Loading..." : "Select a table"}
                            </option>
                            {mesasDisponibles.map(num => (
                                <option key={num} value={num}>
                                    Table {num}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="row status-row">
                        <label className="label">Table Status:</label>
                        <span
                            className={
                                !formData.sede || !formData.mesa
                                    ? "status-na"
                                    : estadoMesa === 1
                                        ? "status-occupied"
                                        : "status-unoccupied"
                            }
                            style={
                                !formData.sede || !formData.mesa
                                    ? { backgroundColor: '#eee', color: '#999', padding: '6px 10px', borderRadius: '8px' }
                                    : {}
                            }
                        >
                            {!formData.sede || !formData.mesa
                                ? "N/A"
                                : estadoMesa === 1
                                    ? "Occupied"
                                    : "Unoccupied"}
                        </span>
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
                            </thead>
                            <tbody>
                                {!isTableSelected ? (
                                    <tr>
                                        <td colSpan="4">No information yet</td>
                                    </tr>
                                ) : estadoMesa !== 1 ? (
                                    <tr>
                                        <td colSpan="4">No information to invoice</td>
                                    </tr>
                                ) : orderDetails.length === 0 ? (
                                    <tr>
                                        <td colSpan="4">No invoice details available</td>
                                    </tr>
                                ) : (
                                    <>
                                        {orderDetails.map(item => (
                                            <tr key={item.idProducto}>
                                                <td>{item.nombre}</td>
                                                <td>{item.cantidad}</td>
                                                <td>{Number(item.precioVenta).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                                                <td>{Number(item.subTotal).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                                            </tr>
                                        ))}
                                        <tr className="total-row">
                                            <td colSpan="2"></td>
                                            <td style={{ fontWeight: 'bold', color: '#0B5BAA' }}>Total amount</td>
                                            <td style={{ fontWeight: 'bold', color: '#0B5BAA' }}>{totalAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="payment-section">
                        <p className="pay-label">Select payment method</p>
                        <div className="payment-buttons">
                            {paymentOptions.map(option => (
                                <button
                                    key={option.id}
                                    className={"tab-btn" + (paymentMethod?.id === option.id ? " pay-btn-selected" : "") + (actionsDisabled ? ' btn-disabled' : '')}
                                    onClick={() => !actionsDisabled && setPaymentMethod(option)}
                                    style={actionsDisabled ? disabledButtonStyle : undefined}
                                    type="button"
                                    disabled={actionsDisabled}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="button-row" style={{ marginTop: '40px' }}>
                        <button
                            type="button"
                            className={`save-btn${!canConfirmPayment ? ' btn-disabled' : ''}`}
                            disabled={!canConfirmPayment}
                            style={!canConfirmPayment ? disabledButtonStyle : undefined}
                            onClick={handleConfirmPayment}
                        >
                            Confirm payment
                        </button>
                    </div>
                    {feedback && feedbackType === 'success' && (
                        <div className="modal-success">
                            <div className="modal-content">
                                <p>{feedback}</p>
                                <button type="button" onClick={handleCloseModal}>OK</button>
                            </div>
                        </div>
                    )}
                    {feedback && feedbackType === 'error' && (
                        <div className="modal-error">
                            <div className="modal-content">
                                <p>{feedback}</p>
                                <button type="button" onClick={handleCloseModal}>OK</button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default CompleteSale;