import React, { useState, useEffect } from 'react';
import './DetectionLog.scss';
import { useAuth } from '../../../context/AuthContext';

const DetectionLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === 'N/A') return 'N/A';
    
    if (/^\d{1,2}:\d{2} [AP]M$/i.test(timeStr)) {
      return timeStr;
    }
    
    const timeParts = timeStr.split(':');
    if (timeParts.length >= 2) {
      const hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${period}`;
    }
    
    return timeStr;
  };

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) {
        setError('Please login to view logs');
        setLoading(false);
        return;
      }
    
      try {
        const apiUrl = 'http://localhost/webapp/Thesis/website-backend/getLogs.php';
        console.log('Fetching logs for user:', user.id); // Debug logging
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: { 
            'Accept': 'application/json',
            'Authorization': `Bearer ${user.id}` // Ensure Bearer prefix
          },
          credentials: 'include'
        });
    
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Server responded with ${response.status}`);
        }
    
        const data = await response.json();
        console.log('Logs data:', data); // Debug logging
        
        setLogs(data.data || []); // Access data property from response
      } catch (err) {
        console.error('Fetch error:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]); // Added user as dependency

  if (loading) {
    return (
      <div className="mainContent">
        <div className="spinner" aria-busy="true"></div>
        <p>Loading detection logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mainContent">
        <h2>Error Loading Data</h2>
        <div className="error-message">
          <p>{error}</p>
          <div className="troubleshooting-tips">
            <p>Please check:</p>
            <ul>
              <li>You are logged in with valid credentials</li>
              <li>The backend service is running</li>
              <li>Your network connection is stable</li>
            </ul>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mainContent">
      <h2>Detection Logs</h2>
      <div className="description">
        Record of plant health detections with timestamps and locations.
      </div>
      
      {logs.length > 0 ? (
        <table className="logs-table">
          <thead>
            <tr>
              <th>IMAGE CODE</th>
              <th>DATE</th>
              <th>TIME</th>
              <th>LOCATION</th>
              <th>IMAGE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={`${log.imageCode}-${log.date}-${log.time}`}>
                <td>{log.imageCode}</td>
                <td>{log.date}</td>
                <td>{log.time}</td>
                <td>{log.location}</td>
                <td className="image-path-cell">
                  <a 
                    href={`http://localhost/webapp/Thesis/website-backend${log.img}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="image-link"
                  >
                    {log.img.split('/').pop()}
                  </a>
                </td>
                <td className={`status ${log.classification.toLowerCase().replace(/\s+/g, '-')}`}>
                  {log.classification}
                  {log.classification !== 'Healthy' && (
                    <span className="warning-icon" aria-label="Warning">⚠️</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-logs">
          <p>No detection logs found for your account</p>
          <button onClick={() => window.location.reload()}>
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
};

export default DetectionLog;