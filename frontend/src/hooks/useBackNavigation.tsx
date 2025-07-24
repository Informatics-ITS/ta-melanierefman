import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useBackNavigation  = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = window.location.pathname;
    const previousPath = localStorage.getItem("currentPath");

    if (currentPath !== previousPath) {
      localStorage.setItem("previousPath", previousPath || "/");
      localStorage.setItem("currentPath", currentPath);
    }
  }, [location.pathname]);
};