import React, { useState, useEffect } from "react";
import { FaUserShield, FaUserPlus, FaUserTimes } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import "./Settings.scss";

const Settings = () => {
  const [userRole, setUserRole] = useState("user");
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", username: "user_jd", password: "jd-ani", role: "admin" },
    { id: 2, name: "Jane Smith", username: "user_js", password: "js-ani", role: "user" },
    { id: 3, name: "Alice Brown", username: "user_ab", password: "ab-ani", role: "user" },
  ]);

  const [newUserName, setNewUserName] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "user";
    setUserRole(role);
  }, []);

  // Function to generate username and password
  const generateCredentials = (fullName) => {
    const nameParts = fullName.trim().split(" ");
    if (nameParts.length < 2) return null; // Ensure both first and last name exist

    const firstInitial = nameParts[0][0].toLowerCase();
    const lastInitial = nameParts[nameParts.length - 1][0].toLowerCase();
    const username = `user_${firstInitial}${lastInitial}`;
    const password = `${firstInitial}${lastInitial}-ani`;

    return { username, password };
  };

  // Change User Role
  const changeUserRole = (id, newRole) => {
    setUsers(users.map(user => (user.id === id ? { ...user, role: newRole } : user)));
  };

  // Add New User
  const addUser = () => {
    if (newUserName.trim() === "") return;

    const credentials = generateCredentials(newUserName);
    if (!credentials) {
      alert("Please enter both first and last names.");
      return;
    }

    const newUser = {
      id: users.length + 1,
      name: newUserName,
      username: credentials.username,
      password: credentials.password,
      role: "user",
    };

    setUsers([...users, newUser]);
    setNewUserName("");
  };

  // Delete User
  const deleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <div className="mainContent">
      <h1>Settings</h1>

      {userRole === "admin" && (
        <>
          {/* User Management */}
          <div className="settingsContainer">
            <h2><FaUserShield /> User Management</h2>
            <p>Modify user roles, reset passwords, add, or remove users.</p>

            {/* Add User Section */}
            <div className="addUser">
              <input
                type="text"
                placeholder="Enter full name (e.g., Diane Quitalig)"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
              <button className="addBtn" onClick={addUser}>
                <FaUserPlus /> Add User
              </button>
            </div>

            {/* User List */}
            <div className="userList">
              {users.map(user => (
                <div key={user.id} className="userItem">
                  <span>{user.name} - {user.role}</span>
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
                  <button className="resetBtn"><RiLockPasswordFill /> Reset Password</button>
                  <button className="deleteBtn" onClick={() => deleteUser(user.id)}>
                    <FaUserTimes /> Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Settings;
