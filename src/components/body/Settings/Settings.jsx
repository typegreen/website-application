import React, { useState, useEffect } from "react";
import { FaUserShield, FaUserPlus, FaUserTimes } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { useAuth } from "../../../context/AuthContext";
import "./Settings.scss";

const Settings = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/getUsers.php`, {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.map(user => ({
        id: user.id,
        username: user.username,
        password: '••••••••', // Placeholder for password
        role: user.accessLevel.toLowerCase() // Convert ADMIN -> admin
      })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const changeUserRole = async (id, newRole) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/updateUser.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({ id, accessLevel: newRole.toUpperCase() })
      });
      

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      setUsers(users.map(user => 
        user.id === id ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const addUser = async () => {
    if (newUsername.trim() === "") {
      setError("Please enter a username");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/addUser.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({ username: newUsername, password: generatePassword(), accessLevel: 'USER' })
      });
      

      if (!response.ok) {
        throw new Error('Failed to add user');
      }

      await fetchUsers();
      setNewUsername("");
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/deleteUser.php?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete user');
        }

        // Only update UI after successful backend deletion
        setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
        
        // Optional: Show success message
        setError(`User ${id} deleted successfully`);
        setTimeout(() => setError(null), 3000);

    } catch (err) {
        setError(err.message);
        console.error("Delete error:", err);
        
        // Refresh the list to ensure consistency with database
        fetchUsers();
    }
  };

  const resetPassword = (id) => {
    alert("Password reset functionality to be implemented");
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

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

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