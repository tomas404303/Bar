import "../Shared/Tasks.css";

function CashierTasks() {
    return (
        <section className="role-section">
        <h3>Cashier Activities</h3>
        <div className="button-grid">
          <button>Complete Sale</button>
          <button>Generate Reports</button>
        </div>
        <button className="single-button">Register Inventory Entries</button>
      </section>
    )
}

export default CashierTasks;