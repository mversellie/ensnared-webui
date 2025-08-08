import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Setup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the first step of setup
    navigate("/setup/network");
  }, [navigate]);

  return null;
};

export default Setup;