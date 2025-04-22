import React, { useState } from "react";
import "./SubmitDataDetection.scss";

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
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      if (!res.ok) throw new Error("Prediction failed");
      const data = await res.json();
      setClassification(data.class);
    } catch (err) {
      console.error(err);
      setClassification("Prediction failed");
    }
  };

  const handleSubmit = async () => {
    if (!form.location || !form.date || !form.time || !form.imageCode || !form.image) {
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

      if (!uploadRes.ok) throw new Error("Image upload failed.");
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;

      const userId = localStorage.getItem("user_id");

      const insertRes = await fetch(`${process.env.REACT_APP_API_BASE}/insertLog.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: form.location,
          date: form.date,
          time: form.time.length === 5 ? form.time + ":00" : form.time,
          image_code: form.imageCode,
          rice_crop_image: imageUrl,
          classification,
          user_id: userId,
        }),
      });

      if (!insertRes.ok) throw new Error("Insertion failed.");
      alert("Detection submitted successfully!");

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
        <p>Please fill out the form and upload an image to classify and submit your detection.</p>

        <div className="formGrid">
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
        </div>

        {imagePreview && (
          <div className="previewBox">
            <img src={imagePreview} alt="Preview" />
          </div>
        )}

        {classification && (
          <div className="classificationBox">
            <strong>Predicted Class:</strong> {classification}
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
