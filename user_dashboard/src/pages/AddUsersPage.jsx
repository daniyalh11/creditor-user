import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

const EXCEL_UPLOAD_LIMIT = 10;
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

const AddUsersForm = () => {
  const [numUsers, setNumUsers] = useState(1);
  const [users, setUsers] = useState([
    { email: "", firstName: "", lastName: "", password: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [addedUsers, setAddedUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  const handleNumUsersChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setNumUsers(value);
    setUsers((prev) => {
      const newUsers = [...prev];
      if (value > prev.length) {
        for (let i = prev.length; i < value; i++) {
          newUsers.push({ email: "", firstName: "", lastName: "", password: "" });
        }
      } else {
        newUsers.length = value;
      }
      return newUsers;
    });
  };

  const handleUserChange = (idx, field, value) => {
    setUsers((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // Expect header row: email, password, firstName, lastName
      const [header, ...rows] = json;
      const headerMap = header.map(h => h && h.toString().toLowerCase().trim());
      const emailIdx = headerMap.indexOf("email");
      const passwordIdx = headerMap.indexOf("password");
      const firstNameIdx = headerMap.indexOf("firstname");
      const lastNameIdx = headerMap.indexOf("lastname");
      if (emailIdx === -1 || passwordIdx === -1 || firstNameIdx === -1 || lastNameIdx === -1) {
        setError("Excel file must have columns: email, password, firstName, lastName");
        return;
      }
      const parsedUsers = rows
        .filter(row => row[emailIdx] && row[passwordIdx] && row[firstNameIdx] && row[lastNameIdx])
        .map(row => ({
          email: row[emailIdx],
          password: row[passwordIdx],
          firstName: row[firstNameIdx],
          lastName: row[lastNameIdx],
        }));
      setUsers(parsedUsers);
      setNumUsers(parsedUsers.length);
      setError("");
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      let response;
      const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];

      if (excelFile) {
        // Excel upload: send as FormData
        const formData = new FormData();
        formData.append('file', excelFile);
        response = await axios.post(
          `${API_BASE}/admin/create-users`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        // Manual entry: send as JSON array
        // Map frontend keys to backend expected keys
        const payload = users.map(u => ({
          email: u.email,
          password: u.password,
          first_name: u.firstName,
          last_name: u.lastName,
        }));
        response = await axios.post(
          `${API_BASE}/admin/create-users`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (response.data && response.data.success) {
        setSuccess(true);
        setAddedUsers(prev => [...prev, ...users]);
        setUsers([{ email: "", firstName: "", lastName: "", password: "" }]);
        setNumUsers(1);
        setExcelFile(null);
      } else {
        setError(response.data.message || "Failed to add users.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setError("");
    setUsers([{ email: "", firstName: "", lastName: "", password: "" }]);
    setNumUsers(1);
    setExcelFile(null);
  };

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 mb-8">
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p className="font-medium">Users added successfully! You can now add more users or view the list of added users.</p>
        </div>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Add More Users
          </button>
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-medium"
          >
            {showUserList ? 'Hide User List' : 'View Added Users'}
          </button>
        </div>

        {showUserList && addedUsers.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Successfully Added Users ({addedUsers.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {addedUsers.map((user, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-800">{user.firstName} {user.lastName}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 mb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Users</h1>
        <p className="text-gray-600">Fill in the details for each user you want to add to the system</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Users to Add</label>
          <select
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
            value={numUsers}
            onChange={handleNumUsersChange}
          >
            {[...Array(20)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        {numUsers > EXCEL_UPLOAD_LIMIT && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-4">
            <p className="text-yellow-800 mb-2 font-medium">For bulk upload, you can use an Excel file (.xlsx) with columns: <b>email, password, firstName, lastName</b>.</p>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelUpload}
              className="mt-2"
            />
          </div>
        )}
        <div className="space-y-6">
          {users.map((user, idx) => (
            <div key={idx} className="border border-gray-200 p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-medium">{idx + 1}</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">User Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={user.email}
                    onChange={(e) => handleUserChange(idx, "email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="text"
                    placeholder="••••••••"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={user.password}
                    onChange={(e) => handleUserChange(idx, "password", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={user.firstName}
                    onChange={(e) => handleUserChange(idx, "firstName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={user.lastName}
                    onChange={(e) => handleUserChange(idx, "lastName", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}
          <button
            type="submit"
            className={`w-full md:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Add Users'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUsersForm; 