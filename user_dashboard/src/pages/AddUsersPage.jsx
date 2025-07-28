import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

const LOCAL_STORAGE_KEY = "addedUsersList";

const AddUsersForm = () => {
  const [numUsers, setNumUsers] = useState(1);
  const [users, setUsers] = useState([
    { email: "", first_name: "", last_name: "", password: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [addedUsers, setAddedUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);

  // Load added users from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setAddedUsers(JSON.parse(stored));
      } catch {
        setAddedUsers([]);
      }
    }
  }, []);

  // Save added users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(addedUsers));
  }, [addedUsers]);
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [showExcelPreview, setShowExcelPreview] = useState(false);

  const handleNumUsersChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setNumUsers(value);
    setUsers((prev) => {
      const newUsers = [...prev];
      if (value > prev.length) {
        for (let i = prev.length; i < value; i++) {
          newUsers.push({ email: "", first_name: "", last_name: "", password: "" });
        }
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
      const [header, ...rows] = json;
      const headerMap = header.map(h => h && h.toString().toLowerCase().trim());
      const emailIdx = headerMap.indexOf("email");
      const passwordIdx = headerMap.indexOf("password");
      const firstNameIdx = headerMap.indexOf("first_name");
      const lastNameIdx = headerMap.indexOf("last_name");
      
      if (emailIdx === -1 || passwordIdx === -1 || firstNameIdx === -1 || lastNameIdx === -1) {
        setError("Excel file must have columns: email, password, first_name, last_name");
        return;
      }
      
      const parsedUsers = rows
        .filter(row => row[emailIdx] && row[passwordIdx] && row[firstNameIdx] && row[lastNameIdx])
        .slice(0, numUsers) // Only take the number of users selected
        .map(row => ({
          email: row[emailIdx],
          password: row[passwordIdx],
          first_name: row[firstNameIdx],
          last_name: row[lastNameIdx],
        }));

      setExcelData(parsedUsers);
      setUsers(parsedUsers);
      setShowExcelPreview(true);
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
          `${API_BASE}/api/auth/admin/create-users`,
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
        const payload = users;
        response = await axios.post(
          `${API_BASE}/api/auth/admin/create-users`,
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
        setAddedUsers(prev => {
          const updated = [...prev, ...users];
          // Save to localStorage here for immediate persistence
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        setUsers([{ email: "", first_name: "", last_name: "", password: "" }]);
        setNumUsers(1);
        setExcelFile(null);
        setExcelData([]);
        setShowExcelPreview(false);
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
    setUsers([{ email: "", first_name: "", last_name: "", password: "" }]);
    setNumUsers(1);
    setExcelFile(null);
    setExcelData([]);
    setShowExcelPreview(false);
  };

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 mb-8">
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p className="font-medium">Successfully added {addedUsers.length} user(s)!</p>
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

        {showUserList && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Added Users ({addedUsers.length})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {addedUsers.map((user, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 mb-8">
      {/* Toggle button for previously added users */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowUserList(!showUserList)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
            showUserList 
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700' 
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
          }`}
        >
          {showUserList ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Hide Users
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              View Users ({addedUsers.length})
            </>
          )}
        </button>
      </div>
      {/* User list (always available) */}
      {showUserList && addedUsers.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Previously Added Users ({addedUsers.length})</h3>
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
        
        {/* Show Excel upload when more than 1 user */}
        {numUsers > 1 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-yellow-800 mb-1">Bulk Upload Option</h3>
                <p className="text-xs text-yellow-700">
                  Upload an Excel file with columns: 
                  <span className="font-mono bg-yellow-100 px-1 mx-1 rounded">email</span>, 
                  <span className="font-mono bg-yellow-100 px-1 mx-1 rounded">password</span>, 
                  <span className="font-mono bg-yellow-100 px-1 mx-1 rounded">firstName</span>, 
                  <span className="font-mono bg-yellow-100 px-1 mx-1 rounded">lastName</span>
                </p>
              </div>
              <label className="cursor-pointer">
                <div className="px-4 py-2 bg-white border border-yellow-400 text-yellow-700 rounded-md text-sm font-medium hover:bg-yellow-50 transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Excel File
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleExcelUpload}
                    className="hidden"
                  />
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Show Excel data preview if uploaded */}
        {showExcelPreview && excelData.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Excel Data Preview ({excelData.length} users)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {excelData.slice(0, 5).map((user, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.firstName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.lastName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    </tr>
                  ))}
                  {excelData.length > 5 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-center text-sm text-gray-500">
                        Showing 5 of {excelData.length} users
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Manual input fields - only show if not using Excel or for 1-2 users */}
        {(!showExcelPreview && numUsers <= 2) && (
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
            {users.map((user, idx) => (
              <div key={idx} className="border border-gray-200 p-6 rounded-lg bg-white shadow-sm">
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
                      value={user.first_name}
                      onChange={(e) => handleUserChange(idx, "first_name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={user.last_name}
                      onChange={(e) => handleUserChange(idx, "last_name", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show summary for manual input when more than 2 users */}
        {(!showExcelPreview && numUsers > 2) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">You've selected to add {numUsers} users</h3>
            <p className="text-gray-600 mb-4">
              Please use the Excel upload option above for adding multiple users, 
              or reduce the number of users to 2 or fewer to enter details manually.
            </p>
          </div>
        )}

        <div className="pt-4">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}
          <button
            type="submit"
            className={`w-full md:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={loading || (!showExcelPreview && numUsers > 2)}
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