import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://creditor-backend-bh52.onrender.com";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("user");
  
  // Clear selected users when filter role changes
  useEffect(() => {
    setSelectedUsers([]);
  }, [filterRole]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [addingToCourse, setAddingToCourse] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ courseTitle: "", addedUsers: [] });
  const [makingInstructor, setMakingInstructor] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Enhanced token retrieval with debugging
      let token = localStorage.getItem('token');
      if (!token) {
        token = document.cookie.split('token=')[1]?.split(';')[0];
      }
      
      console.log('🔍 Token debug:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 20) + '...',
        localStorage: localStorage.getItem('token') ? 'exists' : 'not found',
        cookies: document.cookie.includes('token=') ? 'exists' : 'not found'
      });
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      console.log('📡 Making API call to:', `${API_BASE}/api/user/all`);
      
      const response = await axios.get(`${API_BASE}/api/user/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Include cookies in the request
      });

      console.log('✅ API Response:', response.data);

      if (response.data && response.data.code === 200) {
        setUsers(response.data.data || []);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.message.includes('No authentication token')) {
        setError('No authentication token found. Please log in again.');
      } else {
        setError('Failed to load users. Please try again.');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      // Enhanced token retrieval with debugging
      let token = localStorage.getItem('token');
      if (!token) {
        token = document.cookie.split('token=')[1]?.split(';')[0];
      }
      
      console.log('🔍 Courses - Token debug:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 20) + '...'
      });
      
      if (!token) {
        console.warn(' No token found for courses API call');
        // Still try to fetch courses without token
      }
      
      console.log(' Making courses API call to:', `${API_BASE}/api/course/getAllCourses`);
      
      const response = await axios.get(`${API_BASE}/api/course/getAllCourses`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Include cookies in the request
      });

      console.log('✅ Courses API Response:', response.data);

      if (response.data && response.data.data) {
        setCourses(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        // Handle case where response.data is directly an array
        setCourses(response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      console.error('❌ Courses error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Fallback to dummy courses if API fails
      setCourses([
        { id: "1", title: "Introduction to React" },
        { id: "2", title: "Advanced JavaScript" },
        { id: "3", title: "Web Development Fundamentals" }
      ]);
    }
  };

  // Helper function to get user role from user_roles array
  const getUserRole = (user) => {
    if (user.user_roles && user.user_roles.length > 0) {
      return user.user_roles[0].role;
    }
    return 'user'; // default role when no role is assigned in backend
  };

  // Helper function to get last visited from activity_log
  const getLastVisited = (user) => {
    if (user.activity_log && user.activity_log.length > 0) {
      // Sort by createdAt and get the latest
      const sortedLogs = user.activity_log.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      return sortedLogs[0].createdAt;
    }
    return null;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const userRole = getUserRole(user);
    const matchesRole = userRole === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleAddToCourse = async () => {
    if (selectedUsers.length === 0 || !selectedCourse) return;
    
    try {
      setAddingToCourse(true);
      setError("");
      
      const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      let response;
      
      // Different API endpoints based on the current filter role
      if (filterRole === "user") {
        // Add learners to course
        console.log('🔄 Adding learners to course:', { course_id: selectedCourse, learnerIds: selectedUsers });
        console.log('📋 Available courses:', courses.map(c => ({ id: c.id, title: c.title })));
        console.log('🎯 Selected course details:', courses.find(c => c.id === selectedCourse));
        
        // Check if the selected course actually exists
        const selectedCourseData = courses.find(c => c.id === selectedCourse);
        if (!selectedCourseData) {
          throw new Error(`Course with ID "${selectedCourse}" not found. Available courses: ${courses.map(c => c.id).join(', ')}`);
        }
        
        response = await axios.post(`${API_BASE}/api/course/addLearnerToCourse`, {
          course_id: selectedCourse,
          learnerIds: selectedUsers
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
      } else if (filterRole === "instructor") {
        // Add instructors to course
        console.log('🔄 Adding instructors to course:', { courseId: selectedCourse, instructorIds: selectedUsers });
        console.log('📋 Available courses:', courses.map(c => ({ id: c.id, title: c.title })));
        console.log('🎯 Selected course details:', courses.find(c => c.id === selectedCourse));
        
        // Check if selectedUsers is an array and not empty
        if (!Array.isArray(selectedUsers) || selectedUsers.length === 0) {
          throw new Error('No instructors selected or invalid selection format');
        }
        
        // Check if courseId is valid
        if (!selectedCourse || typeof selectedCourse !== 'string') {
          throw new Error('Invalid course ID');
        }
        
        // Check if the selected course actually exists
        const selectedCourseData = courses.find(c => c.id === selectedCourse);
        if (!selectedCourseData) {
          throw new Error(`Course with ID "${selectedCourse}" not found. Available courses: ${courses.map(c => c.id).join(', ')}`);
        }
        
        response = await axios.post(`${API_BASE}/api/course/addInstructor/${selectedCourse}`, {
          instructorIds: selectedUsers
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
      } else if (filterRole === "admin") {
        // Add admins to course
        console.log('🔄 Adding admins to course:', { courseId: selectedCourse, adminIds: selectedUsers });
        console.log('📋 Available courses:', courses.map(c => ({ id: c.id, title: c.title })));
        console.log('🎯 Selected course details:', courses.find(c => c.id === selectedCourse));
        
        // Check if the selected course actually exists
        const selectedCourseData = courses.find(c => c.id === selectedCourse);
        if (!selectedCourseData) {
          throw new Error(`Course with ID "${selectedCourse}" not found. Available courses: ${courses.map(c => c.id).join(', ')}`);
        }
        
        response = await axios.post(`${API_BASE}/api/course/addAdmin/${selectedCourse}`, {
          adminIds: selectedUsers
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
      }

      console.log('✅ API Response:', response.data);

      if (response.data && (response.data.success || response.data.code === 200 || response.data.code === 201)) {
        // Get the selected course title
        const selectedCourseData = courses.find(course => course.id === selectedCourse);
        const courseTitle = selectedCourseData ? selectedCourseData.title : selectedCourse;
        
        // Get the selected users data
        const addedUsers = users.filter(user => selectedUsers.includes(user.id));
        
        // Set success data and show success modal
        setSuccessData({
          courseTitle: courseTitle,
          addedUsers: addedUsers
        });
        setShowSuccessModal(true);
        
        // Close course selection modal and reset
        setShowCourseModal(false);
        setSelectedCourse("");
        setSelectedUsers([]);
        
        // Refresh users list to get updated course information
        await fetchUsers();
        
        console.log(`${filterRole}s added to course successfully`);
      } else {
        throw new Error(response.data?.message || `Failed to add ${filterRole}s to course`);
      }
    } catch (error) {
      console.error(`Error adding ${filterRole}s to course:`, error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        payload: error.config?.data
      });
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        setError(`Some ${filterRole}s are already assigned to this course. This is normal and won't affect their access.`);
      } else if (error.response?.status === 400) {
        setError('Invalid request. Please check your selection and try again.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 500) {
        setError(`Server error: ${error.response?.data?.message || 'Internal server error occurred. Please try again.'}`);
      } else {
        setError(`Failed to add ${filterRole}s to course. Please try again.`);
      }
    } finally {
      setAddingToCourse(false);
    }
  };

  const handleMakeInstructor = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      setMakingInstructor(true);
      setError("");
      
      const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      console.log('🔄 Making users instructors:', { userIds: selectedUsers });
      
      // Make API call to update user roles to instructor
      const response = await axios.put(`${API_BASE}/api/user/updateRole`, {
        userIds: selectedUsers,
        role: 'instructor'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      console.log('✅ Make Instructor API Response:', response.data);

      if (response.data && (response.data.success || response.data.code === 200 || response.data.code === 201)) {
        // Get the selected users data
        const updatedUsers = users.filter(user => selectedUsers.includes(user.id));
        
        // Set success data and show success modal
        setSuccessData({
          courseTitle: "Role Update",
          addedUsers: updatedUsers
        });
        setShowSuccessModal(true);
        
        // Reset selection
        setSelectedUsers([]);
        
        // Refresh users list to get updated role information
        await fetchUsers();
        
        console.log('Users successfully made instructors');
      } else {
        throw new Error(response.data?.message || 'Failed to update user roles');
      }
    } catch (error) {
      console.error('Error making users instructors:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        payload: error.config?.data
      });
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        setError('Invalid request. Please check your selection and try again.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to perform this action.');
      } else if (error.response?.status === 500) {
        setError(`Server error: ${error.response?.data?.message || 'Internal server error occurred. Please try again.'}`);
      } else {
        setError('Failed to update user roles. Please try again.');
      }
    } finally {
      setMakingInstructor(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilterRole("user")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filterRole === "user"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            User
          </button>
          <button
            onClick={() => setFilterRole("instructor")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filterRole === "instructor"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Instructor
          </button>
          <button
            onClick={() => setFilterRole("admin")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filterRole === "admin"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Add to Course Action */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedUsers.length} {filterRole}(s) selected
            </span>
            <div className="flex gap-2">
              {filterRole === "user" && (
                <button
                  onClick={handleMakeInstructor}
                  disabled={makingInstructor}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {makingInstructor ? 'Updating...' : 'Make Instructor'}
                </button>
              )}
              <button
                onClick={() => setShowCourseModal(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add to Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Selection Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add {filterRole.charAt(0).toUpperCase() + filterRole.slice(1)}s to Course</h3>
              <button
                onClick={() => {
                  setShowCourseModal(false);
                  setError("");
                }}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCourseModal(false);
                  setError("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCourse}
                disabled={!selectedCourse || addingToCourse}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCourse ? 'Adding...' : 'Add to Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Successfully Added!
              </h3>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                {successData.courseTitle === "Role Update" 
                  ? `You have successfully updated <span className="font-semibold text-gray-800">${successData.addedUsers.length} user(s)</span> to instructor role.`
                  : `You have successfully added <span className="font-semibold text-gray-800">${successData.addedUsers.length} ${filterRole}(s)</span> to the course:`
                }
              </p>
              {successData.courseTitle !== "Role Update" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-blue-800">{successData.courseTitle}</p>
                </div>
              )}
              
              <div className="max-h-48 overflow-y-auto">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {successData.courseTitle === "Role Update" ? "Updated users:" : `Added ${filterRole}s:`}
                </p>
                <div className="space-y-2">
                  {successData.addedUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visited
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getUserRole(user) === 'admin' ? 'bg-purple-100 text-purple-800' :
                      getUserRole(user) === 'instructor' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getUserRole(user)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getLastVisited(user) ? new Date(getLastVisited(user)).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search.' 
                : `No ${filterRole}s found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers; 