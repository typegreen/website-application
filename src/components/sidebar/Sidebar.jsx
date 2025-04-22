import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.scss';
import anilogo from '../../assets/anilogo.png';
import { MdLogout } from "react-icons/md";
import { IoImages } from "react-icons/io5";
import { RxActivityLog } from "react-icons/rx";
import { TbReportSearch } from "react-icons/tb";
import { IoIosSettings } from "react-icons/io";
import { BsQuestionCircle } from "react-icons/bs";

const Sidebar = () => {
  const accessLevel = localStorage.getItem("access_level");

  const isAdmin = () => accessLevel === "ADMIN";

  return (
    <div className='sideBar grid'>
      <div className="logoDiv flex">
        <img src={anilogo} alt="AniMonitor" />
        <h2>AniMonitor</h2>
      </div>

      <div className="menuDiv">
        <h3 className="divTitle">CONTROL PANEL</h3>
        <ul className='menuLists grid'>

          {!isAdmin() && (
            <li className='listItem'>
              <NavLink to="/captured-image" className='menuLink flex'>
                <RxActivityLog className='icon' />
                <span className='smallText'>Capture Image</span>
              </NavLink>
            </li>
          )}

          {!isAdmin() && (
            <li className='listItem'>
              <NavLink to="/detection-logs" className='menuLink flex'>
                <RxActivityLog className='icon' />
                <span className='smallText'>Detection Logs</span>
              </NavLink>
            </li>
          )}

          {!isAdmin() && (
            <li className='listItem'>
              <NavLink to="/submit-data" className='menuLink flex'>
                <RxActivityLog className='icon' />
                <span className='smallText'>Upload Data</span>
              </NavLink>
            </li>
          )}

          <li className='listItem'>
            <NavLink to="/report" className='menuLink flex'>
              <TbReportSearch className='icon' />
              <span className='smallText'>Report</span>
            </NavLink>
          </li>

          {isAdmin() && (
            <li className='listItem'>
              <NavLink to="/settings" className='menuLink flex'>
                <IoIosSettings className='icon' />
                <span className='smallText'>Settings</span>
              </NavLink>
            </li>
          )}

          <li className='listItem'>
            <NavLink to="/login" className='menuLink flex'>
              <MdLogout className='icon' />
              <span className='smallText'>Log Out</span>
            </NavLink>
          </li>

        </ul>
      </div>

      <div className="sideBarCard">
        <BsQuestionCircle className='icon' />
        <div className='cardContent'>
          <div className='circle1'></div>
          <div className='circle2'></div>
          <h3>Support Hub</h3>
          <p>Kumusta? May katanungan ka ba o kailangan ng tulong? Handa kaming tumulong sa iyo!</p>
          <button className='btn'>animonitor@gmail.com</button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
