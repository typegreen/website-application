import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.scss'; // Reuse login styles
import '../../App.scss';
import sideimage from '../../assets/Login/sideimage.png';
import logo from '../../assets/Login/logo.png';

const Verify2FA = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    const user_id = localStorage.getItem("2fa_user_id");

    if (!user_id) {
      setError("User session expired. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/verify2FA.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, code })
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        // Store permanent login state
        localStorage.setItem("user_id", data.response.user_id);
        localStorage.setItem("username", data.response.username);
        localStorage.setItem("access_level", data.response.access_level);
        localStorage.removeItem("2fa_user_id");
        localStorage.removeItem("2fa_email");

        navigate("/report");
      } else {
        setError(data.response || "Invalid verification code.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className='loginPage flex'>
      <div className='container flex'>
        <div className='sideImage'>
          <img src={sideimage} alt="Side Design" />
          <div className="textDiv">
            <h2 className='titleStyle'>Two-Factor Authentication</h2>
            <p className='paraStyle'>Secure your account with a verification code.</p>
          </div>
        </div>

        <div className="formDiv flex">
          <div className="headerDiv">
            <img src={logo} alt="AniMonitor Logo" />
            <h3>Enter 6-digit Code</h3>
            <p>Please check your email for the verification code.</p>
          </div>

          <form className="form grid" onSubmit={handleVerify}>
            <div className='inputDiv'>
              <label htmlFor="code"></label>
              <div className='input flex'>
                <input
                  type='text'
                  id='code'
                  placeholder='Enter 6-digit code'
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type='submit' className='btn flex'>
              <span>Verify</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Verify2FA;
