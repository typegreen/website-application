import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.scss';
import './Login.scss';
import sideimage from '../../assets/Login/sideimage.png';
import logo from '../../assets/Login/logo.png';
import { FaKey } from "react-icons/fa";
import { AiOutlineSwapRight } from "react-icons/ai";

const Verify2FA = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const email = localStorage.getItem('2fa_email');
  const user_id = localStorage.getItem('2fa_user_id');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code) {
      setError('Please enter your verification code.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/verify2fa.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, code })
      });

      const data = await response.json();

      if (response.ok && data.response?.status === 'verified') {
        // ✅ Store user_id and access_level
        localStorage.setItem('user_id', user_id);
        localStorage.setItem('access_level', data.response.access_level);
        localStorage.removeItem('2fa_user_id');
        localStorage.removeItem('2fa_email');

        // ✅ Redirect to report page
        navigate('/report');
      } else {
        setError('Invalid or expired code.');
      }
    } catch (err) {
      setError('Verification failed.');
      console.error(err);
    }
  };

  return (
    <div className='loginPage flex'>
      <div className='container flex'>
        <div className='sideImage'>
          <img src={sideimage} alt="Side" />
          <div className="textDiv">
            <h2 className='titleStyle'>Verify your code</h2>
            <p className='paraStyle'>Two-Factor Authentication</p>
          </div>
        </div>

        <div className="formDiv flex">
          <div className="headerDiv">
            <img src={logo} alt="AniMonitor Logo"/>
            <h3>Email Verification</h3>
            <p>We've sent a 6-digit code to: <b>{email}</b></p>
          </div>

          <form className="form grid" onSubmit={handleVerify}>
            <div className='inputDiv'>
              <label htmlFor="code"></label>
              <div className='input flex'>
                <FaKey className='icon'/>
                <input 
                  type='text' 
                  id='code' 
                  placeholder='Enter 6-digit code'
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type='submit' className='btn flex'>
              <span>Verify</span>
              <AiOutlineSwapRight className='icon'/>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Verify2FA;
