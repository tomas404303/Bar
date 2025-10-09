import logo from '../../assets/villaDrinks.png'
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './Login.css'


function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Usuario: usuario, Contrasena: contrasena }),
      });
      
      const data = await response.json();
      if (data.status === "OK") {
        console.log(data);
        localStorage.setItem("cargo", data.cargo);
        localStorage.setItem("sede", data.sede);
        localStorage.setItem("usuario", data.usuario)
        navigate("/dashboard");
      } else {
        // mostrar modal de error
        setError(data.reason || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("No se pudo conectar al servidor");
    }
  };

  const handleCloseModal = () => {
    setError("");
    setUsuario("");
    setContrasena("");
  };

  const isFormIncomplete = !usuario.trim() || !contrasena.trim();

  return (
    <div className='login-background'>
      <div className="login-container">
        <img className='login-logo' src={logo} alt="Logo Villa Drinks" />
        <form className='login-form' onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Username"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="**********"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <button type="submit" disabled={isFormIncomplete}>Login</button>
        </form>

        {/* Modal de error */}
        {error && (
          <div className="modal-error">
            <div className="modal-content">
              <p>Datos incorrectos</p>
              <button onClick={handleCloseModal} >OK</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;