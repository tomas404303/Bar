import logo from "../../assets/copa.png";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./NavBar.css"

function NavBar({ cargo, sede, usuario }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    // Limpia sesión (localStorage, tokens, etc.)
    localStorage.clear();
    navigate("/login");
  };

  const handleClickOutside = (event) => {
    // Si el click NO ocurre dentro del menú o del botón, se cierra
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowMenu(false);
    }
  };

  // Detectar clics fuera del menú
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Logo Villa Drink's" className="navbar-logo" />
        <span className="navbar-title" onClick={() => navigate("/dashboard")}>Villa Drink’s</span>
      </div>
      <div className="navbar-center">
      </div>
      <div className="navbar-right" ref={menuRef}>
        <a onClick={() => navigate("/dashboard")} className="navbar-link">Home</a>
        {/* Avatar usuario */}
        <div className="navbar-user" onClick={() => setShowMenu(!showMenu)}>{usuario.charAt(0).toUpperCase()}</div>
        {/* Menú desplegable */}
        {showMenu && (
          <div className="user-menu">
            <button onClick={handleLogout}>Cerrar sesión</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;