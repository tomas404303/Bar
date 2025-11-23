import { useNavigate } from 'react-router-dom';
import "../Shared/Tasks.css";

function CashierTasks() {
  const navigate = useNavigate();
  return (
      <section className="role-section">
      <h3>Cashier Activities</h3>
      <div className="button-grid">
        <button onClick={() => navigate("/dashboard/cashier/sale")}>Complete Sale</button>
      </div>
      <div className="button-grid">
        <button onClick={() => navigate("/dashboard/cashier/reports")}>Generate Reports</button>
      </div>
      <div className="button-grid">
        <button onClick={() => navigate("/dashboard/cashier/stock")}>Register Inventory Entries</button>
      </div>
    </section>
  )
}

export default CashierTasks;