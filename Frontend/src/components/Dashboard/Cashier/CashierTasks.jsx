import "../Shared/Tasks.css";

function CashierTasks() {
    return (
        <section className="role-section">
        <h3>Cashier Activities</h3>
        <div className="button-grida">
          <button className="build">Complete Sale</button>
          <button className="build">Generate Reports</button>
        </div>
        {/*<button className="single-button">Register Inventory Entries</button>*/}
        <button className="build">Register Inventory Entries</button>
      </section>
    )
}

export default CashierTasks;