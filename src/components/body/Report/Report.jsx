import React, { useEffect, useState } from 'react';
import './Report.scss';

function Report() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/getLogs.php`, {
      headers: {
        apikey: process.env.REACT_APP_SUPABASE_API_KEY,
        Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_API_KEY}`,
      },
    })
      .then(res => res.json())
      .then(res => {
        if (Array.isArray(res)) {
          setData(res);
        }
      });
  }, []);

  const handleSearch = () => {
    const match = data.find(
      (log) =>
        log.user_id?.toString() === searchTerm ||
        log.img?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFiltered(match ? [match] : []);
  };

  return (
    <div className="report">
      <h2>Report</h2>
      <input
        type="text"
        placeholder="Enter User ID or image name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {filtered.map((log, idx) => (
        <div className="report-card" key={idx}>
          <p><strong>User:</strong> {log.user_id}</p>
          <p><strong>Classification:</strong> {log.classification}</p>
          <img src={`${process.env.REACT_APP_API_BASE}${log.img}`} alt="capture" width="100" />
          <p><strong>Location:</strong> {log.location}</p>
          <p><strong>Date:</strong> {log.date}</p>
          <p><strong>Time:</strong> {log.time}</p>
        </div>
      ))}
    </div>
  );
}

export default Report;