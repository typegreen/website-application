import React, { useEffect, useState } from 'react';
import './DetectionLog.scss';

function DetectionLog() {
  const [logs, setLogs] = useState([]);
  const userId = localStorage.getItem("user_id");
  const accessLevel = localStorage.getItem("access_level");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/getLogs.php`, {
      headers: {
        apikey: process.env.REACT_APP_SUPABASE_API_KEY,
        Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_API_KEY}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        const filtered = accessLevel === "ADMIN"
          ? list
          : list.filter((log) => log.user_id?.toString() === userId);
        setLogs(filtered);
      });
  }, [userId, accessLevel]);

  return (
    <div className="detection-log">
      <h2>Detection Logs</h2>
      <div className="log-table">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Classification</th>
              <th>Location</th>
              <th>Date</th>
              <th>Time</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{log.user_id}</td>
                <td>{log.classification}</td>
                <td>{log.location}</td>
                <td>{log.date}</td>
                <td>{log.time}</td>
                <td>
                  <img
                    src={`${process.env.REACT_APP_API_BASE}${log.img}`}
                    alt="Capture"
                    width="50"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DetectionLog;