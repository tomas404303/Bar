import { useNavigate } from 'react-router-dom';
import "../Shared/Tasks.css";

function CashierTasks() {
  const navigate = useNavigate();
  return (
      <section className="role-section">
      <h3>Cashier Activities</h3>
      <div className="button-grida">
        <button className="build">Complete Sale</button>
        <button className="build">Generate Reports</button>
      </div>
      <div className="button-grid">
        <button onClick={() => navigate("/dashboard/cashier/stock")}>Register Inventory Entries</button>
      </div>
    </section>
  )
}

export default CashierTasks;