import React, { useState, useEffect } from "react";
import "./Report.scss";

function Report() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [error, setError] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

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
    setSearchClicked(true);

    let results = logs;

    // Filter by search term
    if (searchTerm) {
      results = results.filter(
        (log) =>
          log.user_id.toString() === searchTerm ||
          (log.image_code &&
            log.image_code.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by classification
    if (classificationFilter !== "all") {
      results = results.filter(
        (log) => log.classification.toLowerCase() === classificationFilter
      );
    }

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      results = results.filter((log) => {
        const logDate = new Date(log.date_of_detection);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return logDate >= startDate && logDate <= endDate;
      });
    }

    // Handle empty results
    if (results.length === 0) {
      setError("No match found.");
      setFiltered([]);
    } else {
      setError("");
      setFiltered(results);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setClassificationFilter("all");
    setDateRange({ start: "", end: "" });
    setFiltered(logs);
    setError("");
    setSearchClicked(false);
  };

  return (
    <div className="mainContent">
      <h1 className="sectionTitle">Report</h1>
      <p className="description">
        Search and view submitted rice crop detection records. Use the filters to refine your search.
      </p>

      <div className="filterContainer">
        <input
          type="text"
          placeholder="Enter Image Code or User ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={classificationFilter}
          onChange={(e) => setClassificationFilter(e.target.value)}
        >
          <option value="all">All Classifications</option>
          <option value="healthy">Healthy</option>
          <option value="diseased">Diseased</option>
        </select>

        <input
          type="date"
          value={dateRange.start}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, start: e.target.value }))
          }
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, end: e.target.value }))
          }
        />

        <button onClick={handleSearch}>Search</button>
        <button onClick={resetFilters}>Reset</button>
      </div>

      {error && <p className="errorMessage">{error}</p>}

      {filtered.map((log, index) => (
        <div key={index} className="reportContainer">
          <div className="infoContainer">
            <div className="detailsSection">
              <p><strong>Image ID:</strong> {log.image_code}</p>
              <p><strong>User ID:</strong> {log.user_id}</p>
              <p><strong>Classification:</strong> {log.classification}</p>
              <p><strong>Location:</strong> {log.location}</p>
              <p><strong>Date:</strong> {log.date_of_detection}</p>
              <p><strong>Time:</strong> {log.time_of_detection}</p>
            </div>

            {/* ✅ Show tips only when user has searched and result is "diseased" */}
            {searchClicked && log.classification.toLowerCase() === "diseased" && (
              <div className="managementTips">
                <h3>Disease Management Tips</h3>
                <ul>
                  <li><strong>Isolation:</strong> For tungro, uproot and burn infected plants. For bacterial infections, bury or cut the affected parts.</li>
                  <li><strong>Early Detection:</strong> Monitor for symptoms within the first 2 weeks, including yellowing or stunted growth.</li>
                  <li><strong>Vector Control:</strong> Watch for green leafhoppers which transmit tungro virus.</li>
                  <li><strong>Pesticide Warning:</strong> Overuse of pesticides can worsen infections or weaken plant defenses.</li>
                </ul>
              </div>
            )}
          </div>

          <div className="imageContainer">
            <img
              src={log.rice_crop_image}
              alt={`Captured ${log.image_code}`}
              className="capturedImage"
              loading="lazy"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Report;
