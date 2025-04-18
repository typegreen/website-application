import React, { useState } from "react";
import "./SubmitDataDetection.scss"; // Reuse Settings.scss styles

const SubmitDetection = () => {
  const [form, setForm] = useState({
    location: "",
    date: "",
    time: "",
    imageCode: "",
    image: null,
  });
  const [error, setError] = useState(null);
  const [classification, setClassification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const file = files ? files[0] : null;
    setForm((prev) => ({
      ...prev,
      [name]: file || value,
    }));
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.location || !form.date || !form.time || !form.imageCode || !form.image) {
      setError("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Predict using Flask backend
      const formData = new FormData();
      formData.append("image", form.image);

      const predictionRes = await fetch(`${process.env.REACT_APP_FLASK_API}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!predictionRes.ok) throw new Error("Prediction failed.");
      const predictionData = await predictionRes.json();
      const predictedClass = predictionData.class;
      setClassification(predictedClass);

      // 2. Upload image to Supabase
      const imageUpload = new FormData();
      imageUpload.append("file", form.image);

      const uploadRes = await fetch(`${process.env.REACT_APP_API_BASE}/uploadToSupabase.php`, {
        method: "POST",
        body: imageUpload,
      });

      if (!uploadRes.ok) throw new Error("Image upload failed.");
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;

      // 3. Insert detection log into database
      const userId = localStorage.getItem("user_id");

      const insertRes = await fetch(`${process.env.REACT_APP_API_BASE}/insertDetectionLog.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: form.location,
          date: form.date,
          time: form.time,
          image_code: form.imageCode,
          rice_crop_image: imageUrl,
          classification: predictedClass,
          user_id: userId,
        }),
      });

      if (!insertRes.ok) throw new Error("Failed to insert detection log.");
      alert("Detection submitted successfully!");

      // Reset form
      setForm({ location: "", date: "", time: "", imageCode: "", image: null });
      setClassification("");
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      setError("Something went wrong during submission.");
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
        <p>Fill out the form below and upload your image for classification.</p>

        <div className="addUser">
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
          />
          <input
            type="text"
            name="imageCode"
            placeholder="Image Code (e.g., IMG001)"
            value={form.imageCode}
            onChange={handleChange}
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />

          <button className="addBtn" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Detection"}
          </button>
        </div>

        {imagePreview && (
          <div style={{ marginTop: "1rem" }}>
            <strong>Preview:</strong>
            <img src={imagePreview} alt="preview" style={{ maxWidth: "200px", marginTop: "0.5rem" }} />
          </div>
        )}

        {classification && (
          <div style={{ marginTop: "1rem" }}>
            <strong>Predicted Class:</strong> {classification}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitDetection;
