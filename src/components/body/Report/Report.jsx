import React, { useState, useEffect } from "react";
import "./Report.scss";

const Report = () => {
  const [reports, setReports] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/getLogs.php`)
      .then(res => res.json())
      .then(data => {
        setReports(data || []);
      })
      .catch(err => {
        console.error("Failed to fetch detection logs:", err);
        setError("Unable to load detection logs.");
      });
  }, []);

  const handleSearch = () => {
    const foundReport = reports.find(r => r.user_id === searchId || r.img === searchId);
    if (foundReport) {
      setSelectedReport(foundReport);
      setError("");
    } else {
      setSelectedReport(null);
      setError("No report found with the given ID or image.");
    }
  };

  return (
    <div className="report-page">
      <h2>Detection Reports</h2>
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter User ID or Image name"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {error && <p className="error">{error}</p>}
      {selectedReport && (
        <div className="report-details">
          <img src={`${process.env.REACT_APP_API_BASE}${selectedReport.img}`} alt="Detected Condition" />
          <p><strong>Classification:</strong> {selectedReport.classification}</p>
          <p><strong>Location:</strong> {selectedReport.location || "N/A"}</p>
          <p><strong>Date:</strong> {selectedReport.date || "Unknown"}</p>
          <p><strong>Time:</strong> {selectedReport.time || "Unknown"}</p>
        </div>
      )}
    </div>
  );
};

export default Report;
