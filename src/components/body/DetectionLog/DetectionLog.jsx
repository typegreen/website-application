import React, { useEffect, useState } from "react";
import "./DetectionLogs.scss";

function DetectionLogs() {
  const [logs, setLogs] = useState([]);
  const userId = localStorage.getItem("user_id");
  const accessLevel = localStorage.getItem("access_level");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/getLogs.php`, {
      method: "GET",
      headers: {
        apikey: process.env.REACT_APP_SUPABASE_KEY,
        Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_KEY}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const results = data.response || [];
        setLogs(
          accessLevel === "ADMIN"
            ? results
            : results.filter((log) => log.user_id.toString() === userId)
        );
      })
      .catch((error) => console.error("Error fetching logs:", error));
  }, [userId, accessLevel]);

  return (
    <div className="detection-log-page">
      <h2>Detection Logs</h2>
      <div className="log-grid">
        {logs.map((log, index) => (
          <div key={index} className="log-card">
            <p><strong>User ID:</strong> {log.user_id}</p>
            <p><strong>Date:</strong> {log.date_of_detection}</p>
            <p><strong>Time:</strong> {log.time_of_detection}</p>
            <p><strong>Classification:</strong> {log.classification}</p>
            {log.rice_crop_image && (
              <img src={log.rice_crop_image} alt="Crop" width="150" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DetectionLogs;