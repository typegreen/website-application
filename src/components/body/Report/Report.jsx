import React, { useState } from "react";
import "./Report.scss";

const Report = () => {
  const reports = [
    {
      id: "img1",
      imageUrl: "https://via.placeholder.com/400", // Replace with actual captured image
      timestamp: "June 16, 2025 | 14:30 PM",
      location: "General Trias, Cavite",
      classification: "Disease-Infected",
      managementTips: [
        "Remove infected plants to prevent spread.",
        "Apply recommended fungicide treatment.",
        "Maintain proper irrigation and soil drainage.",
      ],
    },
    {
      id: "IMG67890",
      imageUrl: "https://via.placeholder.com/400", // Another example image
      timestamp: "June 17, 2025 | 10:15 AM",
      location: "Dasmariñas, Cavite",
      classification: "Healthy",
      managementTips: [
        "Regularly inspect crops for early signs of disease.",
        "Ensure proper fertilization and soil health.",
        "Use crop rotation to prevent soil nutrient depletion.",
      ],
    },
  ];

  const [searchId, setSearchId] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = () => {
    const foundReport = reports.find((report) => report.id === searchId.trim());

    if (foundReport) {
      setSelectedReport(foundReport);
      setError("");
    } else {
      setSelectedReport(null);
      setError("No report found for this Image ID.");
    }
  };

  return (
    <div className="mainContent">
      <h2>Search Detection Report</h2>
      <p className="description">
        Enter the Image ID found in the detection log to view the report.
      </p>

      {/* Search Input */}
      <div className="searchContainer">
        <input
          type="text"
          placeholder="Enter Image ID (e.g., img1)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Error Message */}
      {error && <p className="errorMessage">{error}</p>}

      {/* Display Report if Found */}
      {selectedReport && (
        <div className="reportContainer">
          {/* Right: Image */}
          <div className="imageContainer">
            <img src={selectedReport.imageUrl} alt="Captured" className="capturedImage" />
          </div>

          {/* Left: Stacked Details and Management */}
          <div className="infoContainer">
            {/* Detection Details */}
            <div className="detailsSection">
              <p><strong>Image ID:</strong> {selectedReport.id}</p>
              <p><strong>Timestamp:</strong> {selectedReport.timestamp}</p>
              <p><strong>Location:</strong> {selectedReport.location}</p>
              <p><strong>Classification:</strong> {selectedReport.classification}</p>
            </div>

            {/* Management Tips */}
            <div className="managementTips">
              <h3>Management Tips:</h3>
              <ul>
                {selectedReport.managementTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
