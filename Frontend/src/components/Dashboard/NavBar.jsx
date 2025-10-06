import logo from "../../assets/copa.png";
import { useNavigate } from 'react-router-dom';
import "./NavBar.css"

function NavBar({ cargo, sede }) {
  const usuario = localStorage.getItem("usuario");
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Logo Villa Drink's" className="navbar-logo" />
        <span className="navbar-title" onClick={() => navigate("/dashboard")}>Villa Drink’s</span>
      </div>

      <div className="navbar-center">
        <a href="/home" className="navbar-link">Home</a>
        <a href="/services" className="navbar-link">Services</a>
      </div>

      <div className="navbar-right">
        <div className="navbar-user">{usuario.charAt(0).toUpperCase()}</div>
      </div>
    </nav>
  );
}

export default NavBar;