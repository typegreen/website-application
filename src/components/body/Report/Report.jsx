import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
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

        // Set initial counts
        setHealthyCount(data.filter((log) => log.classification.toLowerCase() === "healthy").length);
        setDiseasedCount(data.filter((log) => log.classification.toLowerCase() === "diseased").length);
      })
      .catch((error) => {
        console.error("Error loading logs:", error);
        setError("Failed to load logs. Please try again later.");
      });
  }, []);

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

  const updateCounts = (data) => {
    setHealthyCount(data.filter((log) => log.classification.toLowerCase() === "healthy").length);
    setDiseasedCount(data.filter((log) => log.classification.toLowerCase() === "diseased").length);
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
    const reportContent = document.getElementById("pdf-container");

    // Generate PDF from the visible report content
    const canvas = await html2canvas(reportContent);
    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    pdf.addImage(imageData, "PNG", 10, 10, 190, 0);

    // Add Pie Chart
    const chartData = [
      { name: "Healthy", value: healthyCount },
      { name: "Diseased", value: diseasedCount },
    ];
    const chartCanvas = document.createElement("canvas");
    chartCanvas.width = 300;
    chartCanvas.height = 300;
    const chartCtx = chartCanvas.getContext("2d");

    const colors = ["#28a745", "#dc3545"];
    let startAngle = 0;

    chartData.forEach((dataPoint, index) => {
      const sliceAngle = (dataPoint.value / (healthyCount + diseasedCount)) * 2 * Math.PI;
      chartCtx.fillStyle = colors[index];
      chartCtx.beginPath();
      chartCtx.moveTo(150, 150);
      chartCtx.arc(150, 150, 150, startAngle, startAngle + sliceAngle);
      chartCtx.closePath();
      chartCtx.fill();
      startAngle += sliceAngle;
    });

    const chartImage = chartCanvas.toDataURL("image/png");
    pdf.addImage(chartImage, "PNG", 10, 160, 190, 100);

    // Save the PDF
    pdf.save("Detection_Report.pdf");
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
              />
              <p><strong>Image ID:</strong> {log.image_code}</p>
              <p><strong>User ID:</strong> {log.user_id}</p>
              <p><strong>Classification:</strong> {log.classification}</p>
              <p><strong>Location:</strong> {log.location}</p>
              <p><strong>Date:</strong> {log.date_of_detection}</p>
              <p><strong>Time:</strong> {log.time_of_detection}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Report;
