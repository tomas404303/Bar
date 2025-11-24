import NavBar from "../../../Layout/NavBar";
import SearchDropdown from "../../../SearchDropdown/SearchDropdown";
import { useState, useEffect } from "react";

function TakeTableOrder() {
    const usuario = localStorage.getItem("usuario");
    const cargo = localStorage.getItem("cargo");
    const sede = localStorage.getItem("sede");

    const [estadoMesa, setEstadoMesa] = useState(null);
    const [orderActive, setOrderActive] = useState(false); // true si hay venta activa
    const [idVenta, setIdVenta] = useState(null); // id de la venta activa

    const [selectedQty, setSelectedQty] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [preOrderItems, setPreOrderItems] = useState([]);

    const [filteredInventario, setFilteredInventario] = useState([]);

    const [sedes, setSedes] = useState([]); 
    const [mesasDisponibles, setMesasDisponibles] = useState([]);
    const [inventario, setInventario] = useState([]);

    const [categorias, setCategorias] = useState([]);
    const [categoriaText, setCategoriaText] = useState("");
    const [loadingMesas, setLoadingMesas] = useState(false);

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        sede: cargo === "Administrator" ? "" : (sede || ""), 
        idCategoria: null,
        categoriaLabel: "",
        mesa: ""
    });

    // ----------------------------------------------------------------------------------------------------
    // ESTADO DE LA MESA: 0 = desocupada, 1 = ocupada
    // ----------------------------------------------------------------------------------------------------

    // Consultar estado de la mesa cada vez que cambian sede o mesa
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

    // ----------------------------------------------------------------------------------------------------
    // CREAR VENTA
    // ----------------------------------------------------------------------------------------------------

    // Handler para el submit del botón Start order
    const handleStartOrder = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");
        if (!formData.sede || !formData.mesa) {
            setError("Select a branch and a table");
            return;
        }
        if (estadoMesa === 1) {
            setError("The table is occupied. A new sale cannot be initiated.");
            return;
        }
        try {
            const url = `http://localhost:8000/pedido/crear/venta?sede=${formData.sede}&numeroMesa=${formData.mesa}`;
            const res = await fetch(url, { method: "POST" });
            const data = await res.json();
            if (data.status === "OK") {
                setSuccess("Sale initiated successfully.");
                if (typeof data.estadoMesa !== "undefined") {
                    setEstadoMesa(data.estadoMesa);
                }
                setOrderActive(true);
                setIdVenta(data.idVenta);
            } else {
                setError("A sale is already active.");
            }
        } catch (err) {
            setError("Error starting sale");
        }
    };

    // ----------------------------------------------------------------------------------------------------
    // Continuar orden
    // ----------------------------------------------------------------------------------------------------

    // Handler para continuar orden (no implementado)
    const handleContinueOrder = (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");
        // Simula continuar orden: habilita botones y recupera idVenta activo
        // Aquí deberías consultar el backend para obtener el idVenta activo de la mesa
        const fetchVentaActiva = async () => {
            try {
                const url = `http://localhost:8000/pedido/activos`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.status === "OK") {
                    const venta = data.pedidos.find(v => v.idSede == formData.sede && v.numeroMesa == formData.mesa);
                    if (venta) {
                        setOrderActive(true);
                        setIdVenta(venta.idVenta);
                        setSuccess("Continue order enabled.");
                    } else {
                        setError("No active order found for this table.");
                    }
                } else {
                    setError("Error fetching active orders.");
                }
            } catch (err) {
                setError("Error fetching active orders.");
            }
        };
        fetchVentaActiva();
    };
    // Handler para cerrar los modales
    const handleCloseModal = () => {
        setSuccess("");
        setError("");
    };

    // ----------------------------------------------------------------------------------------------------
    // AGREGAR PRODUCTO A PREORDEN
    // ----------------------------------------------------------------------------------------------------
    // Función para agregar producto a la preorden
    const handleAddToPreOrder = async (item) => {
        if (!orderActive || !idVenta || !item) return;
        const qty = parseInt(selectedQty[item.idProducto], 10);
        if (!qty || qty <= 0) {
            setError('Enter a valid quantity');
            return;
        }
        // Llamar endpoint backend
        // Obtener valorVenta real del producto
        // Convertir correctamente el valorVenta preservando los miles
        let valorVenta = item.valorVenta;
        if (typeof valorVenta === 'string') {
            // Quitar separadores de miles y convertir a número
            valorVenta = parseInt(valorVenta.replace(/\./g, '').replace(/,/g, ''), 10);
        }
        const payload = {
            idVenta,
            idProducto: item.idProducto,
            cantidad: qty,
            precioVenta: valorVenta,
            subTotal: valorVenta * qty
        };
        try {
            const res = await fetch('http://localhost:8000/pedido/preorden/agregar-producto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.status === 'OK') {
                setSuccess('Product added to pre-order successfully');
                // Limpiar campo Qty
                setSelectedQty(qtyObj => ({ ...qtyObj, [item.idProducto]: '' }));
                // Actualizar inventario local
                setInventario(prevInv => prevInv.map(invItem =>
                    invItem.idProducto === item.idProducto && invItem.idSucursal === item.idSucursal
                        ? { ...invItem, cantidad: invItem.cantidad - qty }
                        : invItem
                ));
                setFilteredInventario(prevInv => prevInv.map(invItem =>
                    invItem.idProducto === item.idProducto && invItem.idSucursal === item.idSucursal
                        ? { ...invItem, cantidad: invItem.cantidad - qty }
                        : invItem
                ));
                // Recargar preorden desde el backend para obtener datos exactos
                const resPreorden = await fetch(`http://localhost:8000/pedido/preorden/detalles/${idVenta}`);
                const dataPreorden = await resPreorden.json();
                if (dataPreorden.status === 'OK') {
                    setPreOrderItems(dataPreorden.detalles);
                }
            } else {
                setError('Error adding product');
            }
        } catch (err) {
            setError('Error adding product');
        }
    };

    // ----------------------------------------------------------------------------------------------------
    // Listar todas las preodenes de la idVenta
    // ----------------------------------------------------------------------------------------------------
    useEffect(() => {
        if (!idVenta) {
            setPreOrderItems([]);
            return;
        }
        const fetchDetallesPreOrden = async () => {
            try {
                const res = await fetch(`http://localhost:8000/pedido/preorden/detalles/${idVenta}`);
                const data = await res.json();
                if (data.status === 'OK') {
                    setPreOrderItems(data.detalles);
                } else {
                    setPreOrderItems([]);
                }
            } catch (err) {
                setPreOrderItems([]);
            }
        };
        fetchDetallesPreOrden();
    }, [idVenta]);


    // ----------------------------------------------------------------------------------------------------
    // AGREGAR PRODUCTO A ORDEN FINAL
    // ----------------------------------------------------------------------------------------------------
    // Handler para confirmar la orden
    const handleConfirmOrder = async () => {
        if (!idVenta || preOrderItems.length === 0) return;
        try {
            const res = await fetch(`http://localhost:8000/pedido/preorden/confirmar/${idVenta}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (data.status === 'OK') {
                setSuccess('Order confirmed successfully');
                setPreOrderItems([]);
                setOrderActive(false);
                setIdVenta(null);
            } else {
                setError(data.error || 'Error confirming order');
            }
        } catch (err) {
            setError('Error confirming order');
        }
    };

    // ----------------------------------------------------------------------------------------------------
    // Limpiar todos los estados locales.
    // ----------------------------------------------------------------------------------------------------
    // Handler para cancelar la orden (solo limpia estados locales)
    const handleCancelOrder = () => {
        setSuccess('Order cancelled successfully');
        setPreOrderItems([]);
        setOrderActive(false);
        setIdVenta(null);
        setSelectedQty({});
        setSelectedProduct(null);
        setFormData({
            sede: cargo === "Administrator" ? "" : (sede || ""),
            idCategoria: null,
            categoriaLabel: "",
            mesa: ""
        });
    };

    // ----------------------------------------------------------------------------------------------------
    // FILTRO DE SEDE, CATEGORÍA
    // ----------------------------------------------------------------------------------------------------
    const filterInventarioWith = (updatedForm) => {
        let data = [...inventario];

        if (cargo !== "Administrator" && updatedForm.sede) {
            data = data.filter(item => item.idSucursal == updatedForm.sede);
        }

        if (cargo === "Administrator" && updatedForm.sede) {
            // admin sí aplicó filtro manual → filtrar
            data = data.filter(item => item.idSucursal == updatedForm.sede);
        }

        // Filtrar por categoría si existe
        if (updatedForm.categoriaLabel?.trim()) {
            data = data.filter(item =>
                item.categoria.toLowerCase().trim() === updatedForm.categoriaLabel.toLowerCase().trim()
            );
        }

        setFilteredInventario(data);
    };

    useEffect(() => {
        filterInventarioWith(formData);
    }, [inventario, categorias]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            filterInventarioWith(updated);
            return updated;
        });
    };

    // ----------------------------------------------------------------------------------------------------
    // CARGAR SEDES
    // ----------------------------------------------------------------------------------------------------
    useEffect(() => {
        async function fetchSedes() {
            try {
                const res = await fetch(`http://localhost:8000/inventario/sedes?cargo=${cargo}&sede=${sede}`);
                const data = await res.json();
                setSedes(data);
            } catch (err) {
                console.error(err);
            }
        }
        fetchSedes();
    }, [cargo, sede]);

    useEffect(() => {
        if (cargo !== "Administrator" && sedes.length > 0) {
            // buscar la sede por nombre
            const match = sedes.find(s => s.nombre === sede);

            if (match) {
                setFormData(prev => {
                    const updated = { ...prev, sede: match.id };
                    filterInventarioWith(updated);
                    return updated;
                });
            }
        }
    }, [sedes]);
    
    // ----------------------------------------------------------------------------------------------------
    // CARGAR MESAS
    // ----------------------------------------------------------------------------------------------------
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
                    // generar [1, 2, 3, ... mesas]
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


    // ----------------------------------------------------------------------------------------------------
    // CARGAR INVENTARIO
    // ----------------------------------------------------------------------------------------------------
    const fetchData = async () => {
        try {
            const res = await fetch(`http://localhost:8000/pedido/productos/?cargo=${cargo}&sede=${sede}`);
            const data = await res.json();
            setInventario(data);
            setFilteredInventario(data); // inicial
        } catch (error) {
            console.error("Error loading inventory data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ----------------------------------------------------------------------------------------------------
    // CARGAR CATEGORÍAS
    // ----------------------------------------------------------------------------------------------------
    const loadCategorias = async () => {
        try {
            const res = await fetch("http://localhost:8000/productos/categorias/listar");
            const data = await res.json();
            setCategorias(data);
        } catch (err) {
            console.error("Error loading categories", err);
        }
    };

    useEffect(() => {
        loadCategorias();
    }, []);

    const categoriasFormateadas = categorias.map(c => ({
        id: c.id,
        label: c.categoria
    }));

    useEffect(() => {
        if (categoriaText.trim() === "") {
            setFormData(prev => {
                const updated = { ...prev, idCategoria: null, categoriaLabel: "" };
                filterInventarioWith(updated);
                return updated;
            });
        }
    }, [categoriaText]);

    

    return (
        <div className="dashboardMain">
            <NavBar usuario={usuario} />

            <div className="manage">
                {/* ------------------------ SECCIÓN 1 ------------------------ */}
                <section className="section">
                    <h2 className="title">Select Table</h2>

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
                                value={
                                    sedes.find(s => s.id === formData.sede)?.nombre || ""
                                }
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
                    <div className="button-row" style={{marginTop:'20px'}}>
                        {estadoMesa === 1 ? (
                            <button
                                type="button"
                                className={`save-btn${!formData.sede || !formData.mesa ? ' btn-disabled' : ''}`}
                                onClick={handleContinueOrder}
                                disabled={!formData.sede || !formData.mesa}
                                style={!formData.sede || !formData.mesa ? { backgroundColor: '#ccc', color: '#666', cursor: 'not-allowed' } : {}}
                            >
                                Continue order
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className={`save-btn${!formData.sede || !formData.mesa ? ' btn-disabled' : ''}`}
                                onClick={handleStartOrder}
                                disabled={!formData.sede || !formData.mesa}
                                style={!formData.sede || !formData.mesa ? { backgroundColor: '#ccc', color: '#666', cursor: 'not-allowed' } : {}}
                            >
                                Start order
                            </button>
                        )}
                    </div>
                </section>

                {/* ------------------------ SECCIÓN 2 ------------------------ */}
                <section className="section">
                    <h2 className="title">Available Products</h2>

                    <div className="row">
                        <label className="label">Category:</label>

                        <SearchDropdown
                            valueText={categoriaText}
                            setValueText={setCategoriaText}
                            data={categoriasFormateadas}
                            placeholder="Search category"
                            allowCreate={false}
                            onSelect={(item) => {
                                setCategoriaText(item.label);

                                setFormData(prev => {
                                    const updated = { 
                                        ...prev, 
                                        idCategoria: item.id, 
                                        categoriaLabel: item.label || "" 
                                    };
                                    filterInventarioWith(updated);
                                    return updated;
                                });
                            }}
                        />
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                {cargo === "Administrator" ? (
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Branch</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th colSpan={2}>Add</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th colSpan={2}>Add</th>
                                    </tr>
                                )}
                            </thead>

                            <tbody>
                                {Array.isArray(filteredInventario) && filteredInventario.length > 0 ? (
                                    filteredInventario.map(item => (
                                        <tr key={`${item.idProducto}-${item.idSucursal}`}>
                                            <td>{item.nombre}</td>
                                            <td>{item.categoria}</td>

                                            {cargo === "Administrator" && (
                                                <td>{item.sede}</td>
                                            )}

                                            <td>{item.cantidad}</td>
                                            <td>$ {item.valorVenta}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="qty-btn"
                                                    min={0}
                                                    placeholder="Qty"
                                                    disabled={!orderActive}
                                                    value={selectedQty[item.idProducto] || ''}
                                                    onChange={e => {
                                                        setSelectedQty(qty => ({ ...qty, [item.idProducto]: e.target.value }));
                                                        setSelectedProduct(item);
                                                    }}
                                                    style={!orderActive ? { backgroundColor: '#eee', color: '#999', cursor: 'not-allowed' } : {}}
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className={`save-btn order-btn${!orderActive ? ' btn-disabled' : ''}`}
                                                    disabled={!orderActive}
                                                    style={!orderActive ? { backgroundColor: '#ccc', color: '#666', cursor: 'not-allowed' } : {}}
                                                    onClick={() => handleAddToPreOrder(item)}
                                                >
                                                    Add to order
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">No inventory records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
                {/* ------------------------ SECCIÓN 3 ------------------------ */}
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
                                {preOrderItems.length > 0 ? (
                                    <>
                                        {preOrderItems.map(item => (
                                            <tr key={item.idProducto}>
                                                <td>{item.nombre}</td>
                                                <td>{item.cantidad}</td>
                                                <td>{item.precioVenta.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                                                <td>{item.subTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                                            </tr>
                                        ))}
                                        <tr className="total-row">
                                            <td colSpan="2"></td>
                                            <td style={{fontWeight:'bold', color:'#0B5BAA'}}>Total</td>
                                            <td className="total-value">
                                                {preOrderItems.reduce((acc, item) => acc + item.subTotal, 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                                            </td>
                                        </tr>
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan="4">No products in pre-order</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="button-row" style={{marginTop:'40px'}}>
                        <button
                            type="button"
                            className={`save-btn${preOrderItems.length === 0 ? ' btn-disabled' : ''}`}
                            disabled={preOrderItems.length === 0}
                            onClick={handleConfirmOrder}
                            style={preOrderItems.length === 0 ? { backgroundColor: '#ccc', color: '#666', cursor: 'not-allowed' } : {}}
                        >
                            Confirm order
                        </button>
                        <button
                            type="button"
                            className={`cancel-btn${preOrderItems.length === 0 ? ' btn-disabled' : ''}`}
                            disabled={preOrderItems.length === 0}
                            onClick={handleCancelOrder}
                            style={preOrderItems.length === 0 ? { backgroundColor: '#ccc', color: '#666', cursor: 'not-allowed' } : {}}
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Modal de Success */}
                    {success && (
                        <div className="modal-success">
                            <div className="modal-content">
                                <p>{success}</p>
                                <button onClick={handleCloseModal}>OK</button>
                            </div>
                        </div>
                    )}

                    {/* Modal de Error */}
                    {error && (
                        <div className="modal-error">
                            <div className="modal-content">
                                <p>{error}</p>
                                <button onClick={handleCloseModal}>OK</button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default TakeTableOrder;