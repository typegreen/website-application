import React, { useState, useEffect } from "react";
import "./Report.scss";

function Report() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const accessLevel = localStorage.getItem("access_level");

    const endpoint =
      accessLevel === "ADMIN"
        ? `${process.env.REACT_APP_API_BASE}/getLogs.php`
        : `${process.env.REACT_APP_API_BASE}/getLogs.php?user_id=${userId}`;

    fetch(endpoint, {
      headers: {
        apikey: process.env.REACT_APP_SUPABASE_API_KEY,
        Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_API_KEY}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        const data = Array.isArray(res) ? res : res.response || [];
        setLogs(data);
        setFiltered(data);
      });
  }, []);

  const handleSearch = () => {
    const result = logs.find(
      (log) =>
        log.user_id.toString() === searchTerm ||
        (log.image_code &&
          log.image_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (result) {
      setFiltered([result]);
      setError("");
    } else {
      setFiltered([]);
      setError("No match found.");
    }
  };

  return (
    <div className="mainContent">
      <h2 className="sectionTitle">Report</h2>
      <div className="searchBar">
        <input
          type="text"
          placeholder="Enter User ID or image name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {error && <p className="errorMessage">{error}</p>}
      {filtered.map((log, index) => (
        <div key={index} className="reportCard">
          <h4>Image ID: {log.image_code}</h4>
          <p><strong>User ID:</strong> {log.user_id}</p>
          <p><strong>Classification:</strong> {log.classification}</p>
          <p><strong>Location:</strong> {log.location}</p>
          <p><strong>Date:</strong> {log.date_of_detection}</p>
          <p><strong>Time:</strong> {log.time_of_detection}</p>
          <img src={log.rice_crop_image} alt="crop" width="250" />
        </div>
      ))}
    </div>
  );
}

export default Report;
