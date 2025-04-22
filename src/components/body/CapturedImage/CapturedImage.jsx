import React, { useState } from "react";
import "./CapturedImage.scss";
import anilogo from "./anilogo.png";

const RPI_LOCAL_API = "http://localhost:8080"; // ✅ Localhost for Pi browser testing

const CapturedImage = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const captureRemotely = async () => {
    setLoading(true);
    setError("");
    setImageSrc(null);

    try {
      const res = await fetch(`${RPI_LOCAL_API}/capture`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Flask server returned an error.");
      }

      const data = await res.json();
      if (!data.image_url) {
        throw new Error("No image returned.");
      }

      setImageSrc(data.image_url); // Supabase public URL
    } catch (err) {
      console.error(err);
      setError("❌ Failed to capture image from the Raspberry Pi.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (imageSrc) {
      const link = document.createElement("a");
      link.href = imageSrc;
      link.download = "ndvi_captured.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
        <button className="capture-image" onClick={downloadImage} disabled={!imageSrc}>
          Download Image
        </button>
      </div>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
};

export default CapturedImage;
