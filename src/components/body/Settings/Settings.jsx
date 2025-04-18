import React, { useState, useEffect } from "react";
import { FaUserShield, FaUserPlus, FaUserTimes } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import "./Settings.scss";

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/getUsers.php`);
      const data = await res.json();

      setUsers(data.map(user => ({
        id: user.user_id,
        username: user.user_name,
        email: user.email,
        role: user.access_level.toLowerCase(),
        passwordLength: user.password ? user.password.length : 10
      })));
    } catch (err) {
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const addUser = async () => {
    if (!newUsername.trim() || !newEmail.trim()) {
      setError("Please enter both a username and an email.");
      return;
    }

    const newUser = {
      username: newUsername,
      password: generatePassword(),
      accessLevel: "USER",
      email: newEmail
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/addUser.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });

      if (!res.ok) throw new Error("Failed to add user");

      setNewUsername("");
      setNewEmail("");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const changeUserRole = async (id, newRole) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/updateUser.php`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, accessLevel: newRole })
      });

      if (!res.ok) throw new Error("Failed to update role");

      setUsers(users.map(user =>
        user.id === id ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/deleteUser.php?id=${id}`, {
        method: "DELETE"
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete user");

      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const resetPassword = (id) => {
    alert("Password reset functionality coming soon.");
  };

  return (
    <div className="mainContent">
      <h1>Settings</h1>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading user data...</p>
      ) : (
        <div className="settingsContainer">
          <h2><FaUserShield /> User Management</h2>
          <p>Modify user roles, reset passwords, add, or remove users.</p>

          <div className="addUser">
            <input
              type="text"
              placeholder="Enter username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <input
              type="email"
              placeholder="Enter email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <button className="addBtn" onClick={addUser}>
              <FaUserPlus /> Add User
            </button>
          </div>

          <div className="userList">
            {users.map(user => (
              <div key={user.id} className="userItem">
                <div>
                  <p><strong>Username:</strong> {user.username}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Password:</strong> {"•".repeat(user.passwordLength)}</p>
                  <p><strong>Role:</strong> {user.role}</p>
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
      )}
    </div>
  );
};

export default Settings;
