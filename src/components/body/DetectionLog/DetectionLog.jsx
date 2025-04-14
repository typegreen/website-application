import React, { useEffect, useState } from 'react';
import './DetectionLog.scss';

const DetectionLog = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.error("User ID not found in localStorage");
      setError("User not found. Please log in again.");
      return;
    }

    const fetchLogs = async () => {
      try {
        const response = await fetch(
          `https://oyicdamiuhqlwqckxjpe.supabase.co/rest/v1/detection_logs?user_id=eq.${userId}`,
          {
            headers: {
              apikey: process.env.REACT_APP_SUPABASE_API_KEY,
              Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_API_KEY}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch detection logs");
        }

        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error("Error loading logs:", error);
        setError("Failed to load detection logs.");
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="mainContent">
      <div className="header flex">
        <h2 className="sectionTitle">Detection Logs</h2>
      </div>

      {error && <div className="errorMessage">{error}</div>}

      <div className="tableContainer">
        <table className="logs-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Classification</th>
              <th>Image</th>
              <th>Location</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.log_id}>
                <td>{log.user_id}</td>
                <td className={log.classification.toLowerCase()}>{log.classification}</td>
                <td>
                  <a 
                    href={log.rice_crop_image} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <img 
                      src={log.rice_crop_image} 
                      alt="crop" 
                      className="log-image" 
                      style={{ width: "100px", height: "auto", cursor: "pointer" }}
                    />
                  </a>
                </td>
                <td>{log.location}</td>
                <td>{log.date_of_detection}</td>
                <td>{log.time_of_detection}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetectionLog;
