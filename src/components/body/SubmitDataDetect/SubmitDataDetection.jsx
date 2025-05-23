import React, { useState, useEffect } from "react";
import "./SubmitDataDetection.scss";

const SubmitDataDetection = () => {
  const [form, setForm] = useState({
    province: "",
    city: "",
    barangay: "",
    date: "",
    time: "",
    imageCode: "",
    image: null,
  });
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [error, setError] = useState(null);
  const [classification, setClassification] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Pre-fill date, time, and image if coming from CapturedImage
    const capturedImageUrl = localStorage.getItem("captured_image_url");
    const capturedDate = localStorage.getItem("captured_date");
    const capturedTime = localStorage.getItem("captured_time");

    if (capturedImageUrl && capturedDate && capturedTime) {
      setForm((prev) => ({
        ...prev,
        date: capturedDate,
        time: capturedTime,
        image: capturedImageUrl,
      }));
      setImagePreview(capturedImageUrl);

      // Run prediction for the captured image
      handlePrediction(capturedImageUrl);

      // Clear the saved data after use
      localStorage.removeItem("captured_image_url");
      localStorage.removeItem("captured_date");
      localStorage.removeItem("captured_time");
    }

    fetch("https://psgc.cloud/api/provinces")
      .then((res) => res.json())
      .then((data) => setProvinces(data));
  }, []);

  useEffect(() => {
    if (form.province) {
      fetch(`https://psgc.cloud/api/provinces/${form.province}/cities-municipalities`)
        .then((res) => res.json())
        .then((data) => setCities(data));
    }
  }, [form.province]);

  useEffect(() => {
    if (form.city) {
      fetch(`https://psgc.cloud/api/cities-municipalities/${form.city}/barangays`)
        .then((res) => res.json())
        .then((data) => setBarangays(data));
    }
  }, [form.city]);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      const file = files[0];
      setForm((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      await handlePrediction(file);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePrediction = async (image) => {
    try {
      const formData = new FormData();

      if (typeof image === "string") {
        // Fetch the image as a blob from the URL
        const response = await fetch(image);
        const blob = await response.blob();
        const file = new File([blob], "captured_image.png", { type: blob.type });
        formData.append("image", file);
      } else {
        // Use the directly uploaded file
        formData.append("image", image);
      }

      const res = await fetch(`${process.env.REACT_APP_FLASK_API}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setClassification(data.class);
      setConfidence(data.confidence);
    } catch (error) {
      console.error(error);
      setClassification("Prediction failed");
      setConfidence(null);
    }
  };

  const handleSubmit = async () => {
    if (
      !form.province ||
      !form.city ||
      !form.barangay ||
      !form.date ||
      !form.time ||
      !form.imageCode ||
      !form.image
    ) {
      setError("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const imageUpload = new FormData();

      if (typeof form.image === "string") {
        // Fetch the blob and convert to File
        const response = await fetch(form.image);
        const blob = await response.blob();
        const fileName = "captured_image_" + Date.now() + ".png";
        const file = new File([blob], fileName, { type: blob.type });
        imageUpload.append("file", file);
      } else {
        // Use the directly uploaded file
        imageUpload.append("file", form.image);
      }

      // Corrected path to uplaodImage.php
      const uploadRes = await fetch(`${process.env.REACT_APP_API_BASE}/uplaodImage.php`, {
        method: "POST",
        body: imageUpload,
      });

      const uploadData = await uploadRes.json();

      if (uploadData.error) {
        setError(uploadData.error);
        setIsSubmitting(false);
        return;
      }

      const userId = localStorage.getItem("user_id");

      await fetch(`${process.env.REACT_APP_API_BASE}/insertLog.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: `${form.province}, ${form.city}, ${form.barangay}`,
          date: form.date,
          time: form.time,
          image_code: form.imageCode,
          rice_crop_image: uploadData.url,
          classification,
          user_id: userId,
        }),
      });

      alert("Detection submitted successfully!");
      setForm({ province: "", city: "", barangay: "", date: "", time: "", imageCode: "", image: null });
      setClassification("");
      setConfidence(null);
      setImagePreview(null);
    } catch (error) {
      console.error(error);
      setError("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mainContent">
      <h1>Submit Detection</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="settingsContainer">
        <h2>Detection Information</h2>
        <p>Please complete the form and upload an image to classify the rice crop.</p>

        <div className="rowGroup">
          <select name="province" value={form.province} onChange={handleChange}>
            <option value="">Select Province</option>
            {provinces.map((p) => (
              <option key={p.psgc_id} value={p.psgc_id}>{p.name}</option>
            ))}
          </select>

          <select name="city" value={form.city} onChange={handleChange} disabled={!form.province}>
            <option value="">Select City/Municipality</option>
            {cities.map((c) => (
              <option key={c.psgc_id} value={c.psgc_id}>{c.name}</option>
            ))}
          </select>

          <select name="barangay" value={form.barangay} onChange={handleChange} disabled={!form.city}>
            <option value="">Select Barangay</option>
            {barangays.map((b) => (
              <option key={b.psgc_id} value={b.name}>{b.name}</option>
            ))}
          </select>

          <input type="date" name="date" value={form.date} onChange={handleChange} />
          <input type="time" name="time" value={form.time} onChange={handleChange} />
        </div>

        <div className="rowGroup">
          <input
            type="text"
            name="imageCode"
            placeholder="Image Code (e.g., IMG001)"
            value={form.imageCode}
            onChange={handleChange}
          />
          <input type="file" name="image" accept="image/*" onChange={handleChange} />
        </div>

        {imagePreview && (
          <div className="previewBox">
            <img src={imagePreview} alt="Preview" />
          </div>
        )}

        {classification && (
          <div className={`classificationBox ${classification.toLowerCase()}`}>
            <strong>{classification === "healthy" ? "🌿 Healthy Crop" : "⚠ Diseased Crop"}</strong>
            {confidence !== null && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.95rem" }}>
                Confidence: {(confidence * 100).toFixed(2)}%
              </p>
            )}
          </div>
        )}

        <button className="submitBtn" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Detection"}
        </button>
      </div>
    </div>
  );
};

export default SubmitDataDetection;
