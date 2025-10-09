import NavBar from "../Layout/NavBar";
import Welcome from "./Shared/Welcome";
import "./DashboardLayout.css";

function DashboardLayout({ children, cargo, sede, usuario }) {
    return (
        <div className="dashboardMain">
            <NavBar cargo={cargo} sede={sede} usuario={usuario} />
            <div className="dashboard-container">
                <Welcome cargo={cargo} sede={sede} usuario={usuario}/>
                <div>{children}</div>
            </div>
            <footer></footer>
        </div>
    )
}

export default DashboardLayout;