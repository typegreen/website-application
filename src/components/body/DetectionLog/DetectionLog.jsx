
import React, { useEffect, useState } from 'react';
import './DetectionLog.scss';

const DetectionLog = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            console.error("User ID not found in localStorage");
            return;
        }

        const fetchLogs = async () => {
            try {
                const response = await fetch(`https://oyicdamiuhqlwqckxjpe.supabase.co/rest/v1/detection_logs?user_id=eq.${userId}`, {
                    headers: {
                        apikey: process.env.REACT_APP_SUPABASE_API_KEY,
                        Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_API_KEY}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch detection logs");
                }

                const data = await response.json();
                setLogs(data);
            } catch (error) {
                console.error("Error loading logs:", error);
            }
        };

        fetchLogs();
    }, []);

    return (
        <div className="detection-log">
            <h2>Detection Logs</h2>
            <table>
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Classification</th>
                        <th>Image</th>
                        <th>Location</th>
                        <th>Date</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log.log_id}>
                            <td>{log.user_id}</td>
                            <td>{log.classification}</td>
                            <td><img src={log.rice_crop_image} alt="crop" width="100" /></td>
                            <td>{log.location}</td>
                            <td>{log.date_of_detection}</td>
                            <td>{log.time_of_detection}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DetectionLog;
