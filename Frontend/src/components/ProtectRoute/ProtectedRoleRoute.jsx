import { Navigate } from "react-router-dom";

const ProtectedRoleRoute = ({ children, roles }) => {
    const isLogged = localStorage.getItem("isLogged");
    const userRole = localStorage.getItem("cargo");

    if (!isLogged) {
        return <Navigate to="/login" replace />;
    }

    // Si no tiene permisos
    if (!roles.includes(userRole)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoleRoute;
