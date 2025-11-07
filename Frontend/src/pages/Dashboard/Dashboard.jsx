import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import alerta from "../../assets/alerta.png";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import AdminTasks from "../../components/Dashboard/Administrator/AdminTasks";
import CashierTasks from "../../components/Dashboard/Cashier/CashierTasks";
import WaiterTasks from "../../components/Dashboard/Waiter/WaiterTasks";

import useIdleTimer from "../../hook/useIdleTimer";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("isLogged")) {
      navigate("/login");
    }
  }, []);

  useIdleTimer(() => {
    import("sweetalert2").then((Swal) => {
      Swal.default.fire({
        title: "INACTIVITY",
        html: `
          <img src="${alerta}" alt="alerta" width="80" style="margin-bottom: 15px;" />
          <p>You have been inactive for 3 minutes.<br>Your session will be ended.</p>
        `,
        confirmButtonText: "OK",
        width: 350,
        padding: "20px",
        color: "#2c3e50",
        confirmButtonColor: "#3498db",
      }).then(() => {
        localStorage.clear();
        navigate("/login");
      });
    });
  }, 3 * 60 * 1000); 

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
