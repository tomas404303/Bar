import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import alerta from "../assets/alerta.svg";
import useIdleTimer from "../hook/useIdleTimer";

const IdleProvider = ({ children }) => {
  const navigate = useNavigate();

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

  return children;
};

export default IdleProvider;
