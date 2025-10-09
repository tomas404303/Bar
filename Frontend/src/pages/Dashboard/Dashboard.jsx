import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import AdminTasks from "../../components/Dashboard/Administrator/AdminTasks";
import CashierTasks from "../../components/Dashboard/Cashier/CashierTasks";
import WaiterTasks from "../../components/Dashboard/Waiter/WaiterTasks";

function Dashboard() {
    const cargo = localStorage.getItem("cargo");
    const sede = localStorage.getItem("sede");
    const usuario = localStorage.getItem("usuario");

    return (
        <DashboardLayout cargo={cargo} sede={sede} usuario={usuario}>
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
