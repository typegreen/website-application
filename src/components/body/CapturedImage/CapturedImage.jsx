import React, { useRef, useState, useEffect } from "react";
import "./CapturedImage.scss";
import anilogo from "./anilogo.png";

const CapturedImage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [stream, setStream] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  // Open Camera
  const openCamera = async () => {
    try {
      console.log("Opening Camera...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        console.log("Video element updated!");
      }

      setStream(mediaStream);
      setCameraOpen(true);
      setImageSrc(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // Ensure video is updated when camera opens
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      console.log("Video source set after state update.");
    }
  }, [stream]);

  // Capture Image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Match canvas to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataURL = canvas.toDataURL("image/png", 1.0);
      setImageSrc(imageDataURL);

      // Auto-download image
      const link = document.createElement("a");
      link.href = imageDataURL;
      link.download = "captured_image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Close Camera
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCameraOpen(false);
    setImageSrc(null);
    console.log("Camera closed.");
  };

  return (
    <div className="mainContent">
      <h2>Capture Image</h2>

      <div className="cameraContainer">
        {cameraOpen ? (
          <video ref={videoRef} className="videoFeed" autoPlay playsInline width="100%" height="100%" />
        ) : imageSrc ? (
          <img src={imageSrc} alt="Captured" className="capturedImage" />
        ) : (
          <img src={anilogo} alt="AniMonitor Logo" className="logoImage" />
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="buttonContainer">
        <button className="open-camera" onClick={openCamera}>
          Open Camera
        </button>
        <button className="capture-image" onClick={captureImage} disabled={!cameraOpen}>
          Capture Image
        </button>
        <button className="close-camera" onClick={closeCamera}>
          Close Camera
        </button>
      </div>
    </div>
  );
};

export default CapturedImage;
