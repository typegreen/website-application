import React, { useEffect, useState } from "react";
import "./Report.scss";

function Report() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/getLogs.php`, {
      method: "GET",
      headers: {
        apikey: process.env.REACT_APP_SUPABASE_KEY,
        Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_KEY}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setLogs(data.response || []))
      .catch((error) => console.error("Error fetching logs:", error));
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.user_id.toString().includes(search) ||
      (log.image_code && log.image_code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="report-page">
      <h2>Detection Reports</h2>
      <input
        type="text"
        placeholder="Enter User ID or Image name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="log-grid">
        {filteredLogs.map((log, idx) => (
          <div key={idx} className="log-card">
            <p><strong>User ID:</strong> {log.user_id}</p>
            <p><strong>Date:</strong> {log.date_of_detection}</p>
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

export default Report;