import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Verify2FA = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();

    const user_id = localStorage.getItem("2fa_user_id");
    if (!user_id) {
      setError("User not found. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/verify2FA.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_id, code })
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        // ✅ Store logged-in user
        localStorage.setItem("user_id", data.response.user_id);
        localStorage.setItem("username", data.response.username);
        localStorage.setItem("access_level", data.response.access_level);
        
        // 🔐 Clean up temporary 2FA storage
        localStorage.removeItem("2fa_user_id");
        localStorage.removeItem("2fa_email");

        navigate("/report");
      } else {
        setError(data.response || "Invalid code. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Try again later.");
      console.error(err);
    }
  };

  return (
    <div className="verify2fa-page">
      <div className="verify-box">
        <h2>Verify 2FA</h2>
        <p>Please enter the 6-digit code sent to your email.</p>
        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            maxLength={6}
          />
          <button type="submit">Verify</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default Verify2FA;
