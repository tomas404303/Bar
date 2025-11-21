import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import AdminTasks from "../../components/Dashboard/Administrator/AdminTasks";
import CashierTasks from "../../components/Dashboard/Cashier/CashierTasks";
import WaiterTasks from "../../components/Dashboard/Waiter/WaiterTasks";

import Swal from "sweetalert2";
import useIdleTimer from "../../hook/useIdleTimer";
import alerta from "../../assets/alerta.svg";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("isLogged")) {
      navigate("/login");
    }
  }, []);

  const handleInactivity = () => {
    Swal.fire({
      title: "INACTIVITY",
      html: `
        <img src="${alerta}" alt="alerta"/>
        <p>You have been inactive for 3 minutes.<br>Your session will be ended.</p>
      `,
        confirmButtonText: "OK",
        customClass: {
          popup: "my-swal-popup",
          title: "my-swal-title",
          htmlContainer: "my-swal-html",
        },
        confirmButtonColor: "#1E90FF",
    }).then(() => {
      localStorage.clear();
      navigate("/login");
    });
  };

  useIdleTimer(handleInactivity, 3 * 60 * 1000);

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
