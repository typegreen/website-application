import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import the auth context
import './Login.scss';
import '../../App.scss';
import sideimage from '../../assets/Login/sideimage.png';
import logo from '../../assets/Login/logo.png';
import { FaUserShield } from "react-icons/fa6";
import { BsFillShieldLockFill } from "react-icons/bs";
import { AiOutlineSwapRight } from "react-icons/ai";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from context
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: username, password: password })
      });

      const data = await response.json();

      if (response.ok && data.response?.login === "pending_2fa") {
        const user_id = data.response.user_id;
        const email = data.response.email;
      
        // Save temporarily for use in Verify2FA.jsx
        localStorage.setItem("2fa_user_id", user_id);
        localStorage.setItem("2fa_email", email);
      
        // ✅ Trigger 2FA email
        const emailRes = await fetch(`${process.env.REACT_APP_API_BASE}/email2FA.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id, email })
        });
      
        const emailData = await emailRes.json();
        if (!emailRes.ok) {
          console.error("2FA Email failed:", emailData);
          setError("Failed to send 2FA code. Please try again.");
          return;
        }
      
        // Redirect to 2FA input screen
        navigate("/verify-2fa");
      }
      
       else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Server error. Try again later.");
      console.error("Login failed:", err);
    }
  };

  return (
    <div className='loginPage flex'>
      <div className='container flex'>
        <div className='sideImage'>
          <img src={sideimage} alt="Side" />
          <div className="textDiv">
            <h2 className='titleStyle'>Growing Solutions, One Crop at a Time</h2>
            <p className='paraStyle'>Kaakibat ng mga Magsasaka!</p>
          </div>
        </div>

        <div className="formDiv flex">
          <div className="headerDiv">
            <img src={logo} alt="AniMonitor Logo"/>
            <h3>Maligayang Pagbabalik!</h3>
            <p>Secure access starts here. Please log in using your credentials.</p>
          </div>

          <form className="form grid" onSubmit={handleLogin}>
            <div className='inputDiv'>
              <label htmlFor="username"></label>
              <div className='input flex'>
                <FaUserShield className='icon'/>
                <input 
                  type='text' 
                  id='username' 
                  placeholder='Username'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className='inputDiv'>
              <label htmlFor="password"></label>
              <div className='input flex'>
                <BsFillShieldLockFill className='icon'/>
                <input 
                  type='password' 
                  id='password' 
                  placeholder='Password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <span>Login</span>
              <AiOutlineSwapRight className='icon'/>
            </button>

            <span className='forgotPassword'>
              <a href='/forgot-password'>Forgot password?</a>
            </span>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;