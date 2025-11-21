import { useEffect, useRef } from "react";

const useIdleTimer = (onTimeout, timeout = 3 * 60 * 1000) => {
  const timerRef = useRef(null);

  const resetTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onTimeout, timeout);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, [onTimeout, timeout]);

  return { resetTimer };
};

export default useIdleTimer;