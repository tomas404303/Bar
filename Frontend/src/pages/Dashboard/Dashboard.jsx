import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import AdminTasks from "../../components/Dashboard/AdminTasks";
import CashierTasks from "../../components/Dashboard/CashierTasks";
import WaiterTasks from "../../components/Dashboard/WaiterTasks";

function Dashboard() {
    const cargo = localStorage.getItem("cargo");
    const sede = localStorage.getItem("sede");

    return (
        <DashboardLayout cargo={cargo} sede={sede}>
            {cargo === "Administrator" && (
                <>
                    <AdminTasks />
                    <CashierTasks />
                    <WaiterTasks />
                </>
            )}
            {cargo === "Cashier" && <CashierTasks />}
            {cargo === "Waiter" && <WaiterTasks />}
            
        </DashboardLayout>
    );
}

export default Dashboard;
