import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.scss'; // reuse the same SCSS
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
        // Store user info
        localStorage.setItem("user_id", data.response.user_id);
        localStorage.setItem("username", data.response.username);
        localStorage.setItem("access_level", data.response.access_level);

        // Clean up
        localStorage.removeItem("2fa_user_id");
        localStorage.removeItem("2fa_email");

        // Redirect
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
    <div className='loginPage flex'>
      <div className='container flex'>
        <div className='sideImage'>
          <h2 className='titleStyle'>Verify<br />your code</h2>
          <p className='paraStyle'>Two-Factor Authentication</p>
        </div>

        <div className="formDiv flex">
          <div className="headerDiv">
            <img src={logo} alt="AniMonitor Logo"/>
            <h3>Email Verification</h3>
            <p>We've sent a 6-digit code to:<br /><strong>{email}</strong></p>
          </div>

          <div className="form grid">
            <div className="inputDiv">
              <div className="input flex">
                <FaKey className='icon' />
                <input
                  type='text'
                  placeholder='Enter 6-digit code'
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength="6"
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button onClick={handleVerify} className='btn flex'>
              <span>Verify</span>
              <AiOutlineArrowRight className='icon'/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify2FA;
