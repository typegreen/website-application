import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Verify2FA = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async () => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      setError("User ID missing.");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/verify2FA.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, code }),
      });

      const data = await res.json();

      if (res.ok && data.response?.verified) {
        // ✅ Success → Redirect to appropriate page
        const access_level = localStorage.getItem("access_level");
        if (access_level === "ADMIN") {
          navigate("/settings");
        } else {
          navigate("/report");
        }
      } else {
        setError(data.response?.error || "Invalid code.");
      }
    } catch (err) {
      console.error(err);
      setError("Verification failed.");
    }
  };

  return (
    <div className="verify-container">
      <h2>Enter your 2FA Code</h2>
      <input
        type="text"
        placeholder="Enter the code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleVerify}>Verify</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Verify2FA;
