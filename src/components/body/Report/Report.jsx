import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Report.scss";

function Report() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [error, setError] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [healthyCount, setHealthyCount] = useState(0);
  const [diseasedCount, setDiseasedCount] = useState(0);

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
      });
  }, []);

  const updateCounts = (data) => {
    setHealthyCount(
      data.filter((log) => log.classification.toLowerCase() === "healthy")
        .length
    );
    setDiseasedCount(
      data.filter((log) => log.classification.toLowerCase() === "diseased")
        .length
    );
  };

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
      updateCounts(results);
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

  const exportToPDF = async () => {
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFontSize(16);
    doc.text("Detection Report", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Search Term: ${searchTerm || "All"}`, 10, 30);
    doc.text(`Classification Filter: ${classificationFilter}`, 10, 40);
    if (dateRange.start && dateRange.end) {
      doc.text(
        `Date Range: ${dateRange.start} to ${dateRange.end}`,
        10,
        50
      );
    }
    doc.text(`Total Healthy: ${healthyCount}`, 10, 60);
    doc.text(`Total Diseased: ${diseasedCount}`, 10, 70);

    // Pie chart
    const chartCanvas = document.createElement("canvas");
    chartCanvas.width = 300;
    chartCanvas.height = 300;
    const chartCtx = chartCanvas.getContext("2d");
    const chartData = [
      { label: "Healthy", value: healthyCount, color: "#28a745" },
      { label: "Diseased", value: diseasedCount, color: "#dc3545" },
    ];
    let startAngle = 0;
    const total = healthyCount + diseasedCount;
    chartData.forEach((slice) => {
      const sliceAngle = (slice.value / total) * 2 * Math.PI;
      chartCtx.fillStyle = slice.color;
      chartCtx.beginPath();
      chartCtx.moveTo(150, 150);
      chartCtx.arc(
        150,
        150,
        150,
        startAngle,
        startAngle + sliceAngle
      );
      chartCtx.closePath();
      chartCtx.fill();
      startAngle += sliceAngle;
    });
    const chartImage = chartCanvas.toDataURL("image/png");
    doc.addImage(chartImage, "PNG", 30, 80, 150, 150);

    // Logs table on page 2+
    doc.addPage();
    let yOffset = 20;
    doc.setFontSize(14);
    doc.text("Detection Logs", 105, yOffset, { align: "center" });
    yOffset += 10;
    doc.setFontSize(10);
    filtered.forEach((log) => {
      doc.text(`Image ID: ${log.image_code}`, 10, yOffset);
      doc.text(`User ID: ${log.user_id}`, 10, yOffset + 5);
      doc.text(`Classification: ${log.classification}`, 10, yOffset + 10);
      doc.text(`Location: ${log.location}`, 10, yOffset + 15);
      doc.text(`Date: ${log.date_of_detection}`, 10, yOffset + 20);
      doc.text(`Time: ${log.time_of_detection}`, 10, yOffset + 25);
      yOffset += 35;
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
    });

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

            {/* Display filtered logs as cards */}
      <div className="logList">
        {filtered.length > 0 ? (
          filtered.map((log) => (
            <div key={log.image_code} className="reportContainer">
              {/* renamed from .cardDetails to .infoContainer */}
              <div className="infoContainer">
                <div className="detailsSection">
                  <p><strong>Image ID:</strong> {log.image_code}</p>
                  <p><strong>User ID:</strong> {log.user_id}</p>
                  <p><strong>Classification:</strong> {log.classification}</p>
                  <p><strong>Location:</strong> {log.location}</p>
                  <p><strong>Date:</strong> {log.date_of_detection}</p>
                  <p><strong>Time:</strong> {log.time_of_detection}</p>
                </div>

                {/* Disease tips */}
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

              {/* renamed from .cardImage to .imageContainer */}
              <div className="imageContainer">
                <img
                  src={log.rice_crop_image}
                  alt={`Captured ${log.image_code}`}
                  className="capturedImage"
                  loading="lazy"
                />
              </div>
            </div>
          ))
        ) : (
          searchClicked && <p>No records to display.</p>
        )}
      </div>
    </div>
  );
}

export default Report;
