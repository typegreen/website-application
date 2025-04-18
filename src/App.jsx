import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import './App.css';
import Sidebar from '../src/components/sidebar/Sidebar';
import CapturedImage from './components/body/CapturedImage/CapturedImage';
import DetectionLogs from './components/body/DetectionLog/DetectionLog';
import Report from './components/body/Report/Report';
import Settings from './components/body/Settings/Settings';
import LogOut from './components/body/LogOut/LogOut';
import Login from './components/auth/Login';
import Verify2FA from './components/auth/Verify2FA';
import SubmitDataDetect from './components/body/SubmitDataDetect/SubmitDataDetection';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
        <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-2fa" element={<Verify2FA />} />

          <Route 
            path="/*" 
            element={
              <div className="container">
                <Sidebar />
                  <Routes>
                    <Route path="/captured-image" element={<CapturedImage />} />
                    <Route path="/detection-logs" element={<DetectionLogs />} />
                    <Route path="/submit-data" element={<SubmitDataDetect />} />
                    <Route path="/report" element={<Report />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/logout" element={<LogOut />} />
                  </Routes>
                </div>
            } 
          />
        </Routes>
      </Router>
      </AuthProvider>
  );
}

export default App;
