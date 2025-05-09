import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Report.scss";

function Report() {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [healthyCount, setHealthyCount] = useState(0);
  const [diseasedCount, setDiseasedCount] = useState(0);
  const [searchClicked, setSearchClicked] = useState(false);
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
        updateCounts(data);
      })
      .catch((error) => {
        console.error("Error loading logs:", error);
        setError("Failed to load logs. Please try again later.");
      });
  }, []);

  const updateCounts = (data) => {
    setHealthyCount(data.filter((log) => log.classification.toLowerCase() === "healthy").length);
    setDiseasedCount(data.filter((log) => log.classification.toLowerCase() === "diseased").length);
  };

  const handleSearch = () => {
    setSearchClicked(true);

    let results = logs;

    // Filter by search term
    if (searchTerm) {
      results = results.filter(
        (log) =>
          log.user_id.toString().includes(searchTerm) ||
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

    // Update filtered logs and counts
    setFiltered(results);
    updateCounts(results);

    if (results.length === 0) {
      setError("No match found.");
    } else {
      setError("");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setClassificationFilter("all");
    setDateRange({ start: "", end: "" });
    setFiltered(logs);
    setError("");
    setSearchClicked(false);
    updateCounts(logs);
  };

  const exportToPDF = async () => {
    const doc = new jsPDF("p", "mm", "a4");
    const container = document.getElementById("pdf-container");

    // Add title and search info
    doc.setFontSize(16);
    doc.text("Detection Report", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Search Term: ${searchTerm || "All"}`, 10, 30);
    doc.text(`Classification Filter: ${classificationFilter}`, 10, 40);
    if (dateRange.start && dateRange.end) {
      doc.text(`Date Range: ${dateRange.start} to ${dateRange.end}`, 10, 50);
    }
    doc.text(`Total Healthy: ${healthyCount}`, 10, 60);
    doc.text(`Total Diseased: ${diseasedCount}`, 10, 70);

    // Convert the HTML content to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
    });
    const imageData = canvas.toDataURL("image/png");
    doc.addImage(imageData, "PNG", 10, 80, 190, 150);

    // Save the PDF
    doc.save("Detection_Report.pdf");
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

        {searchClicked && filtered.length > 0 && (
          <button className="printBtn" onClick={exportToPDF}>
            📄 Export to PDF
          </button>
        )}
      </div>

      {error && <p className="errorMessage">{error}</p>}

      <div id="pdf-container">
        {filtered.map((log, index) => (
          <div key={index} className="reportContainer">
            <div className="infoContainer">
              <img
                src={log.rice_crop_image}
                alt={`Captured ${log.image_code}`}
                className="capturedImage"
                loading="lazy"
                style={{ maxWidth: "150px", marginBottom: "10px" }}
              />
              <p><strong>Image ID:</strong> {log.image_code}</p>
              <p><strong>User ID:</strong> {log.user_id}</p>
              <p><strong>Classification:</strong> {log.classification}</p>
              <p><strong>Location:</strong> {log.location}</p>
              <p><strong>Date:</strong> {log.date_of_detection}</p>
              <p><strong>Time:</strong> {log.time_of_detection}</p>

              {searchClicked && log.classification.toLowerCase() === "diseased" && (
                <div className="managementTips">
                  <h3>Disease Management Tips</h3>
                  <ul>
                    <li>Isolate infected plants immediately.</li>
                    <li>Use appropriate pesticides.</li>
                    <li>Monitor closely for further symptoms.</li>
                    <li>Maintain proper field hygiene.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Report;
