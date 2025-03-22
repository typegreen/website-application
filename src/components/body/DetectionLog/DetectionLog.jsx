import React from 'react';
import './DetectionLog.scss';

const logs = [
  {
    imageCode: 'IMG001',
    date: '2025-02-26',
    time: '10:30 AM',
    location: 'Field A',
    classification: 'Healthy',
    img: 'plant1.png',
  },
  {
    imageCode: 'IMG002',
    date: '2025-02-25',
    time: '2:15 PM',
    location: 'Field B',
    classification: 'Disease-infected',
    img: 'plant2.png',
  },
];

const DetectionLog = () => {
  return (
    <div className="mainContent">
      <h2>Detection Logs</h2>
      <p className="description">
        Below is a record of detected plant conditions, including timestamps, locations, health status, and image codes.
      </p>
      <table className="logs-table">
        <thead>
          <tr>
            <th>IMAGE CODE</th>
            <th>DATE</th>
            <th>TIME</th>
            <th>LOCATION</th>
            <th>IMAGE</th>
            <th>CLASSIFICATION</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index}>
              <td>{log.imageCode}</td>
              <td>{log.date}</td>
              <td>{log.time}</td>
              <td>{log.location}</td>
              <td className="icon">
                <a href={`assets/${log.img}`} target="_blank" rel="noopener noreferrer">
                  <img src={`assets/${log.img}`} alt={`Plant ${log.imageCode}`} />
                </a>
              </td>
              <td className={log.classification === 'Healthy' ? 'healthy' : 'infected'}>
                {log.classification}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DetectionLog;
