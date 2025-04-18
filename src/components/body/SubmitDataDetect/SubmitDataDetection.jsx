import React, { useState } from "react";
import "./Settings.scss"; // Reuse the existing style
import axios from "axios";

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.location || !form.date || !form.time || !form.imageCode || !form.image) {
        setError("All fields are required.");
        return;
      }

      setIsSubmitting(true);
      setError(null);

      // 1. Predict using Flask ML backend
      const formData = new FormData();
      formData.append("image", form.image);

      const predictionRes = await axios.post(
        `${process.env.REACT_APP_FLASK_API}/predict`,
        formData
      );
      const predictedClass = predictionRes.data.class;
      setClassification(predictedClass);

      // 2. Upload image to Supabase (use your upload logic here)
      const imageUpload = new FormData();
      imageUpload.append("file", form.image);

      const imageRes = await axios.post(
        `${process.env.REACT_APP_API_BASE}/uploadToSupabase.php`,
        imageUpload
      );

      const imageUrl = imageRes.data.url;

      // 3. Save full detection log to Supabase DB
      const userId = localStorage.getItem("user_id");
      await axios.post(`${process.env.REACT_APP_API_BASE}/insertDetectionLog.php`, {
        location: form.location,
        date: form.date,
        time: form.time,
        image_code: form.imageCode,
        rice_crop_image: imageUrl,
        classification: predictedClass,
        user_id: userId,
      });

      alert("Detection submitted successfully!");
      setForm({ location: "", date: "", time: "", imageCode: "", image: null });
      setClassification("");
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
            placeholder="Location"
            name="location"
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
            placeholder="Image Code (e.g., IMG001)"
            name="imageCode"
            value={form.imageCode}
            onChange={handleChange}
          />
          <input
            type="file"
            accept="image/*"
            name="image"
            onChange={handleChange}
          />
          <button className="addBtn" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Detection"}
          </button>
        </div>

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
