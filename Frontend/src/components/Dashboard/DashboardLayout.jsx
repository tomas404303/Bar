import NavBar from "../../components/Dashboard/NavBar";
import Welcome from "../../components/Dashboard/Welcome";
import "./DashboardLayout.css";

function DashboardLayout({ children, cargo, sede }) {
    return (
        <div className="dashboardMain">
            <NavBar cargo={cargo} sede={sede} />
            <div className="dashboard-container">
                <Welcome />
                <div>{children}</div>
            </div>
            <footer></footer>
        </div>
    )
}

export default DashboardLayout;