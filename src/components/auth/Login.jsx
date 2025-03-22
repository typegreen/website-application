import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.scss';
import '../../App.scss';
import sideimage from '../../assets/Login/sideimage.png';
import logo from '../../assets/Login/logo.png';
import { FaUserShield } from "react-icons/fa6";
import { BsFillShieldLockFill } from "react-icons/bs";
import { AiOutlineSwapRight } from "react-icons/ai";

const Login = () => {
  const navigate = useNavigate(); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault(); 

    // Demo credentials
    const adminUser = { username: "admin", password: "admin123", role: "admin" };
    const normalUser = { username: "user", password: "user123", role: "user" };

    if (username === adminUser.username && password === adminUser.password) {
      localStorage.setItem("userRole", adminUser.role);
      navigate('/captured-image');
    } else if (username === normalUser.username && password === normalUser.password) {
      localStorage.setItem("userRole", normalUser.role);
      navigate('/captured-image');
    } else {
      alert("Invalid credentials!");
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
            <p>Secure access starts here. Please log in using the credentials provided by the system admin.</p>
          </div>

          <form className="form grid">
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
                />
              </div>
            </div>
            
            <button type='button' className='btn flex' onClick={handleLogin}>
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
