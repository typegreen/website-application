import React, { useState, useEffect } from "react";
import "./SubmitDataDetection.scss";

const SubmitDetection = () => {
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
  const [confidence, setConfidence] = useState(null); // ✅ New state
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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

  const handlePrediction = async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await fetch(`${process.env.REACT_APP_FLASK_API}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setClassification(data.class);
      setConfidence(data.confidence); // ✅ Store confidence score
    } catch {
      setClassification("Prediction failed");
      setConfidence(null); // ✅ Reset confidence if failed
    }
  };

  const handleSubmit = async () => {
    if (!form.province || !form.city || !form.barangay || !form.date || !form.time || !form.imageCode || !form.image) {
      setError("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const imageUpload = new FormData();
      imageUpload.append("file", form.image);

      const uploadRes = await fetch(`${process.env.REACT_APP_API_BASE}/uplaodImage.php`, {
        method: "POST",
        body: imageUpload,
      });

      const uploadData = await uploadRes.json();
      const userId = localStorage.getItem("user_id");

      const insertRes = await fetch(`${process.env.REACT_APP_API_BASE}/insertLog.php`, {
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
      setConfidence(null); // ✅ Reset confidence after submit
      setImagePreview(null);
    } catch {
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

export default SubmitDetection;
