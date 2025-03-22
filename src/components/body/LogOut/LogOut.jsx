import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LogOut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");

    navigate("/login");
  }, [navigate]);

  return (
    <div>
      <h2>Logging Out...</h2>
    </div>
  );
};

export default LogOut;
