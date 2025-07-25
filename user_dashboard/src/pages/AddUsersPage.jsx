import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddUsersPage = () => {
  const [courseId, setCourseId] = useState("");
  const [numUsers, setNumUsers] = useState(1);
  const [users, setUsers] = useState([{ email: "", firstName: "", lastName: "", phone: "" }]);
  const navigate = useNavigate();

  const handleNumUsersChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setNumUsers(value);
    setUsers((prev) => {
      const arr = [...prev];
      if (arr.length < value) {
        while (arr.length < value) arr.push({ email: "", firstName: "", lastName: "", phone: "" });
      } else {
        arr.length = value;
      }
      return arr;
    });
  };

  const handleUserChange = (idx, field, value) => {
    setUsers((prev) => {
      const arr = [...prev];
      arr[idx][field] = value;
      return arr;
    });
  };

  const handleAddUsers = () => {
    // Placeholder: Replace with actual API call
    alert(`Adding ${numUsers} users to course ${courseId}`);
    // Reset form or navigate as needed
    navigate(-1);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add Users to Course</h1>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Course ID</label>
        <input
          type="text"
          className="border rounded px-3 py-2 w-full"
          value={courseId}
          onChange={e => setCourseId(e.target.value)}
          placeholder="Enter Course ID"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Number of Users</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={numUsers}
          onChange={handleNumUsersChange}
        >
          {[...Array(20)].map((_, i) => (
            <option key={i+1} value={i+1}>{i+1}</option>
          ))}
        </select>
      </div>
      {users.map((user, idx) => (
        <div key={idx} className="mb-4 border p-3 rounded bg-gray-50">
          <div className="mb-2 font-semibold">User {idx + 1}</div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              className="border rounded px-3 py-2"
              placeholder="Email"
              value={user.email}
              onChange={e => handleUserChange(idx, "email", e.target.value)}
              required
            />
            <input
              type="text"
              className="border rounded px-3 py-2"
              placeholder="First Name"
              value={user.firstName}
              onChange={e => handleUserChange(idx, "firstName", e.target.value)}
              required
            />
            <input
              type="text"
              className="border rounded px-3 py-2"
              placeholder="Last Name"
              value={user.lastName}
              onChange={e => handleUserChange(idx, "lastName", e.target.value)}
              required
            />
            <input
              type="tel"
              className="border rounded px-3 py-2"
              placeholder="Phone Number"
              value={user.phone}
              onChange={e => handleUserChange(idx, "phone", e.target.value)}
            />
          </div>
        </div>
      ))}
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow w-full mt-4"
        onClick={handleAddUsers}
        disabled={!courseId || users.some(u => !u.email || !u.firstName || !u.lastName)}
      >
        Add Users
      </button>
    </div>
  );
};

export default AddUsersPage; 