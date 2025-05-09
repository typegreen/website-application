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
        "Content-Type": "application/json",
        apikey: process.env.REACT_APP_SUPABASE_API_KEY,
        Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_API_KEY}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        // Ensure data is always an array
        const data = Array.isArray(res) ? res : res.response || [];
        
        // Set initial logs and counts
        setLogs(data);
        setFiltered(data);
        updateCounts(data);

        // ✅ Debug Check - Initial Logs
        console.log("Initial Logs Loaded:", data);
        console.log("Initial Filtered Logs:", data);
      })
      .catch((error) => {
        console.error("Error loading logs:", error);
        setError("Failed to load logs. Please try again later.");
      });
  }, []);

  const updateCounts = (data) => {
    const healthyLogs = data.filter((log) => log.classification.toLowerCase() === "healthy");
    const diseasedLogs = data.filter((log) => log.classification.toLowerCase() === "diseased");
    setHealthyCount(healthyLogs.length);
    setDiseasedCount(diseasedLogs.length);

    // ✅ Debug Check - Updated Counts
    console.log("Updated Healthy Count:", healthyLogs.length);
    console.log("Updated Diseased Count:", diseasedLogs.length);
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

    // ✅ Debug Check - Filtered Logs
    console.log("Filtered Logs After Search:", results);

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

    // ✅ Debug Check - Logs After Reset
    console.log("Logs After Reset:", logs);
  };

  const exportToPDF = async () => {
    const doc = new jsPDF("p", "mm", "a4");

    // Add search details on the first page
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

    // Add a pie chart
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
      chartCtx.arc(150, 150, 150, startAngle, startAngle + sliceAngle);
      chartCtx.closePath();
      chartCtx.fill();
      startAngle += sliceAngle;
    });

    const chartImage = chartCanvas.toDataURL("image/png");
    doc.addImage(chartImage, "PNG", 30, 80, 150, 150);

    // Add table of filtered logs on the second page
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

      // Add new page if too long
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
    });

    // Save the PDF
    doc.save("Detection_Report.pdf");
  };

  return (
    <div className="mainContent">
      <h1 className="sectionTitle">Report</h1>
      <p className="description">
        Search and view submitted rice crop detection records. Use the filters to refine your search.
      </p>
