import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Verify2FA.scss';
import logo from '../../assets/Login/logo.png';
import { AiOutlineArrowRight } from "react-icons/ai";
import { FaKey } from 'react-icons/fa';

const Verify2FA = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const user_id = localStorage.getItem('2fa_user_id');
  const email = localStorage.getItem('2fa_email');

  const handleVerify = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/verify2FA.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, code })
      });

      const data = await response.json();

      if (response.ok && data.response.login === "success") {
        localStorage.setItem("user_id", data.response.user_id);
        localStorage.setItem("username", data.response.username);
        localStorage.setItem("access_level", data.response.access_level);
        localStorage.removeItem("2fa_user_id");
        localStorage.removeItem("2fa_email");
        navigate("/report");
      } else {
        setError(data.response || "Verification failed.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Server error. Try again later.");
    }
  };

  return (
    <div className='verify2fa-wrapper'>
      <div className='verify2fa-container'>
        <div className='verify2fa-left'>
          <h2>Verify<br />your code</h2>
          <p>Two-Factor Authentication Powered by Brevo</p>
        </div>

        <div className="verify2fa-right">
          <div className="verify2fa-header">
            <img src={logo} alt="AniMonitor Logo" />
            <h3>Email Verification</h3>
            <p>
              Mabuhay! We've sent a 6-digit code to:<br />
              <strong>{email}</strong>
            </p>
          </div>

          <div className="verify2fa-form">
            <div className="verify2fa-input-group">
              <FaKey className='icon' />
              <input
                type='text'
                placeholder='Enter 6-digit code'
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength="6"
              />
            </div>

            {error && <div className="verify2fa-error">{error}</div>}

            <button className='verify2fa-button' onClick={handleVerify}>
              Verify <AiOutlineArrowRight className='icon' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify2FA;
