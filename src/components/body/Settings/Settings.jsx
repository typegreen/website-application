import React, { useState, useEffect } from "react";
import { FaUserShield, FaUserPlus, FaUserTimes } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import "./Settings.scss";

const Settings = () => {
  const accessLevel = localStorage.getItem("access_level");
  const userId = localStorage.getItem("user_id");

  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = () => accessLevel === "ADMIN";

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/getUsers.php`, {
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });
      const data = await response.json();
      setUsers(data.map(user => ({
        id: user.id,
        username: user.username,
        password: '••••••••',
        role: user.accessLevel.toLowerCase()
      })));
    } catch (err) {
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&";
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const changeUserRole = async (id, newRole) => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE}/updateUser.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`
        },
        body: JSON.stringify({ id, accessLevel: newRole.toUpperCase() })
      });
      setUsers(users.map(user => user.id === id ? { ...user, role: newRole } : user));
    } catch (err) {
      setError("Failed to update role.");
    }
  };

  const addUser = async () => {
    if (!newUsername.trim()) {
      setError("Username required.");
      return;
    }
    try {
      await fetch(`${process.env.REACT_APP_API_BASE}/addUser.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`
        },
        body: JSON.stringify({
          username: newUsername,
          password: generatePassword(),
          accessLevel: 'USER'
        })
      });
      await fetchUsers();
      setNewUsername("");
    } catch (err) {
      setError("Failed to add user.");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/deleteUser.php?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setUsers(users.filter(user => user.id !== id));
      setError(`Deleted user ${id}`);
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError("Failed to delete user.");
      fetchUsers(); // Refresh if error
    }
  };

  const resetPassword = (id) => {
    alert("Password reset functionality to be implemented.");
  };

  if (!isAdmin()) {
    return (
      <div className="mainContent">
        <h1>Settings</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mainContent">
        <h1>Settings</h1>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="mainContent">
      <h1>Settings</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="settingsContainer">
        <h2><FaUserShield /> User Management</h2>
        <div className="addUser">
          <input
            type="text"
            placeholder="Enter username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <button className="addBtn" onClick={addUser}>
            <FaUserPlus /> Add User
          </button>
        </div>

        <div className="userList">
          {users.map(user => (
            <div key={user.id} className="userItem">
              <span>{user.username} - {user.role}</span>
              <div>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Password:</strong> {user.password}</p>
              </div>
              <select
                value={user.role}
                onChange={(e) => changeUserRole(user.id, e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button className="resetBtn" onClick={() => resetPassword(user.id)}>
                <RiLockPasswordFill /> Reset Password
              </button>
              <button className="deleteBtn" onClick={() => deleteUser(user.id)}>
                <FaUserTimes /> Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
