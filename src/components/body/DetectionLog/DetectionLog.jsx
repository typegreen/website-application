import React, { useEffect, useState } from "react";
import "./DetectionLog.scss";

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
        const results = Array.isArray(res) ? res : res.response || [];
        const filtered = accessLevel === "ADMIN"
          ? results
          : results.filter((log) => log.user_id.toString() === userId);
        setLogs(filtered);
      });
  }, [userId, accessLevel]);

  return (
    <div className="detection-log">
      <h2>Detection Logs</h2>
      <table>
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
          {logs.map((log, index) => (
            <tr key={index}>
              <td>{log.user_id}</td>
              <td>{log.classification}</td>
              <td><img src={log.rice_crop_image} alt="crop" width="60" /></td>
              <td>{log.location}</td>
              <td>{log.date_of_detection}</td>
              <td>{log.time_of_detection}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DetectionLog;