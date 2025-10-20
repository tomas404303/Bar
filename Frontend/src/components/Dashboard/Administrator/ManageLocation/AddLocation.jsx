import { useState } from "react";

function AddLocation({onSede}) {
    const [formData, setFormData] = useState({
        nombre: "",
        direccion: "",
    });

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");

        try {
            const response = await fetch("http://localhost:8000/sedes/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    direccion: formData.direccion,
                    estado: 1
                }),
            });

            const result = await response.json();

            if (result.status === "OK") {
                setSuccess("Branch created correctly");
                setFormData({
                    nombre: "",
                    direccion: "",
                    estado: 1,
                });

                onSede();
            } else {
                setError("Error creating branch");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleClean = () => {
        setFormData({
            nombre: "",
            direccion: "",
            estado: 1,
        })
    }

    const handleCloseModal = () => {
        setSuccess("");
        setError("");
    };

    return (
        <section className="section">
            <h2 className="title">Add Location</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div>
                        <label>Name</label>
                        <input type="text" name="nombre" value={formData.nombre}
                            onChange={handleChange} required/>
                    </div>
                </div>
                <div className="form-row">
                    <div>
                        <label>Address</label>
                        <input type="text" name="direccion" value={formData.direccion}
                            onChange={handleChange} required/>
                    </div>
                </div>

                <div className="button-row">
                    <button type="submit" className="save-btn">Save</button>
                    <button type="button" className="cancel-btn" onClick={handleClean}>Cancel</button>
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
    )
}

export default AddLocation