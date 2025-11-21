import { useNavigate } from 'react-router-dom';
import "../Shared/Tasks.css";

function WaiterTasks() {
    const navigate = useNavigate();
    return (
        <section className="role-section">
            <h3>Waiter Activities</h3>
            <div className="button-grid">
                <button onClick={() => navigate("/dashboard/waiter/order")}>Take Table Order</button>
            </div>
        </section>
    )
}

export default WaiterTasks;