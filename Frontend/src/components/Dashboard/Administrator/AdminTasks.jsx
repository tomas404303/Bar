import { useNavigate } from 'react-router-dom';
import "../Shared/Tasks.css";


function AdminTasks() {
    const navigate = useNavigate();
    return (
        <section className="role-section">
            <h3>Administrative Activities</h3>
            <div className="button-grid">
                <button onClick={() => navigate("/dashboard/admin/locations")}>Manage Locations</button>
                <button onClick={() => navigate("/dashboard/admin/users")}>Manage Users</button>
            </div>
            <div className="button-grid">
                <button onClick={() => navigate("/dashboard/admin/tables")}>Manage Tables</button>
                <button onClick={() => navigate("/dashboard/admin/inventory")}>Manage Inventory</button>
            </div>
        </section>
    )
}

export default AdminTasks;