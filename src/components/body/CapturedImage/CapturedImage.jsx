import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CapturedImage.scss";
import anilogo from "../../../assets/anilogo.png";

const RPI_SERVER = "http://localhost:8080";

const CapturedImage = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const captureRemotely = async () => {
    setLoading(true);
    setError("");
    setImageSrc(null);

    try {
      const res = await fetch(`${RPI_SERVER}/capture`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Flask server returned an error.");
      }

      const data = await res.json();
      if (!data.image_url) {
        throw new Error("No image returned.");
      }

      // Set image and timestamp in localStorage
      const currentDate = new Date();
      const date = currentDate.toISOString().split("T")[0];
      const time = currentDate.toTimeString().split(" ")[0];

      localStorage.setItem("captured_image_url", data.image_url);
      localStorage.setItem("captured_date", date);
      localStorage.setItem("captured_time", time);

      // Redirect to SubmitDataDetect
      navigate("/submit-data");
    } catch (err) {
      console.error(err);
      setError("❌ Failed to capture image from the Raspberry Pi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mainContent">
      <h2>Remote NDVI Capture (Local Pi Mode)</h2>

      <div className="cameraContainer">
        {loading ? (
          <p>📸 Capturing from Raspberry Pi...</p>
        ) : imageSrc ? (
          <img src={imageSrc} alt="NDVI Image" className="capturedImage" />
        ) : (
          <img src={anilogo} alt="AniMonitor Logo" className="logoImage" />
        )}
      </div>

      <div className="buttonContainer">
        <button className="open-camera" onClick={captureRemotely} disabled={loading}>
          {loading ? "Capturing..." : "Capture Image"}
        </button>
      </div>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
};

export default CapturedImage;
