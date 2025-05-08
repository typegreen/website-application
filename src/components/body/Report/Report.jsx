import React, { useState, useEffect, useRef } from "react";
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
  const reportRef = useRef();

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

    // Update classification counts
    const healthyLogs = results.filter((log) => log.classification.toLowerCase() === "healthy");
    const diseasedLogs = results.filter((log) => log.classification.toLowerCase() === "diseased");
    setHealthyCount(healthyLogs.length);
    setDiseasedCount(diseasedLogs.length);

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

    // Reset counts
    setHealthyCount(logs.filter((log) => log.classification.toLowerCase() === "healthy").length);
    setDiseasedCount(logs.filter((log) => log.classification.toLowerCase() === "diseased").length);
  };

  const exportToPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const dataUrl = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
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
      </div>

      {searchClicked && filtered.length > 0 && (
        <div className="printContainer">
          <button className="printBtn" onClick={exportToPDF}>
            📄 Export to PDF
          </button>
        </div>
      )}

      <div ref={reportRef} className="printableReport">
        {filtered.map((log, index) => (
          <div key={index} className="reportContainer">
            <div className="infoContainer">
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
