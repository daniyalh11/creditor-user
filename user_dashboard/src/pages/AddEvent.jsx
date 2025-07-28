

import React, { useState, useEffect } from "react";
import { currentUserId } from "@/data/currentUser";
import { getAllEvents } from "@/services/calendarService";
import { fetchUserProfile } from "@/services/userService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const DEFAULT_TIMEZONE = "America/New_York";
const AddEvent = () => {
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [userTimezone, setUserTimezone] = useState(DEFAULT_TIMEZONE);
  const [courses, setCourses] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [form, setForm] = useState({
    id: "", // <-- add this
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    timeZone: DEFAULT_TIMEZONE,
    location: "",
    isRecurring: false,
    recurrence: "none",
    zoomLink: "",
    courseId: ""
  });
  const [editIndex, setEditIndex] = useState(null);
  const [showPastDateModal, setShowPastDateModal] = useState(false);

  // Get authentication token from cookies
  const getAuthToken = () => {
    return Cookies.get("token");
  };

  // Get user role from localStorage
  const getUserRole = () => {
    return localStorage.getItem("userRole") || "";
  };

  // Decode JWT token to see what's in it
  const decodeToken = () => {
    const token = getAuthToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded JWT token:", decoded);
        return decoded;
      } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
      }
    }
    return null;
  };

  // Try to refresh the token to get one with role information
  const refreshToken = async () => {
    try {
      console.log("Attempting to refresh token...");
      // This would require the user's credentials, which we don't have stored
      // For now, let's just log that we need a token with role information
      console.log("Current token doesn't contain role information. Need to contact backend team to include role in JWT token.");
      return false;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return false;
    }
  };

  // URL validation function
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Fetch user profile to get timezone and role
  useEffect(() => {
    const fetchUserProfileData = async () => {
      try {
        const data = await fetchUserProfile();
        const timezone = data.timezone || DEFAULT_TIMEZONE;
        setUserTimezone(timezone);
        // Update form timezone as well
        setForm(prev => ({ ...prev, timeZone: timezone }));
        
        // Set user role
        const role = getUserRole();
        setUserRole(role);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };
    fetchUserProfileData();
  }, []);

  // Fetch courses from API with proper authentication
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/getAllCourses`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-User-Role': getUserRole(), // Add role in header as well
          },
          credentials: 'include'
        });
        const data = await response.json();
        if (data && data.data) {
          setCourses(data.data);
          // Set first course as default if available
          if (data.data.length > 0) {
            setForm(prev => ({ ...prev, courseId: data.data[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEvents();
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };
    fetchEvents();
  }, []);

  // Generate calendar for selected month/year
  const firstDay = new Date(calendarYear, calendarMonth, 1);
  const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  const calendarDays = [];
  for (let i = 0; i < startDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(new Date(calendarYear, calendarMonth, d));

  const handleDateClick = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clicked = new Date(date);
    clicked.setHours(0, 0, 0, 0);

    if (clicked < today) {
      setShowPastDateModal(true);
      return;
    }

    setSelectedDate(date);
    setForm({
      id: "", // <-- clear the id for new event
      title: "",
      description: "",
      startTime: date ? date.toISOString().slice(0, 16) : "",
      endTime: date ? date.toISOString().slice(0, 16) : "",
      timeZone: userTimezone, // Use user's timezone
      location: "",
      isRecurring: false,
      recurrence: "none",
      zoomLink: "",
      courseId: courses.length > 0 ? courses[0].id : ""
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleEdit = (index) => {
    const event = events[index];
    setSelectedDate(event.date);
    setForm({
      id: event.id, // <-- add this
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      timeZone: event.timeZone,
      location: event.location,
      isRecurring: event.isRecurring,
      recurrence: event.recurrence || "none",
      zoomLink: event.zoomLink || "",
      courseId: event.courseId || courses.length > 0 ? courses[0].id : ""
    });
    setEditIndex(index);
    setShowModal(true);
  };

  const handleDelete = async (index) => {
    const event = events[index];
    if (!event.id) {
      // If no id, just remove from local state
      setEvents(events.filter((_, i) => i !== index));
      return;
    }
    try {
      const token = getAuthToken();
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/calendar/events/${event.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-User-Role": getUserRole(), // Add role in header as well
        },
        credentials: "include"
      });
      // Refetch events after deletion
      const data = await getAllEvents();
      // Normalize course_id to courseId for all events
      const normalizedEvents = data.map(ev => ({
        ...ev,
        courseId: ev.courseId || ev.course_id
      }));
      setEvents(normalizedEvents);
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user has permission to create events
    const currentRole = getUserRole();
    if (!currentRole || (currentRole !== 'admin' && currentRole !== 'instructor')) {
      console.error("User does not have permission to create events. Required role: admin or instructor. Current role:", currentRole);
      alert("You don't have permission to create events. Only administrators and instructors can create events.");
      return;
    }
    
    // Decode and log the JWT token to see what's in it
    const decodedToken = decodeToken();
    console.log("Token contents:", decodedToken);
    
    // Prepare payload for backend
    const selectedCourse = courses.find(c => c.id === form.courseId);
    const toIsoUtc = (dateString) => {
      if (!dateString) return "";
      if (dateString.endsWith('Z')) return dateString;
      if (dateString.length === 19) return dateString + 'Z';
      if (dateString.length === 16) return dateString + ':00Z';
      return new Date(dateString).toISOString();
    };

    const payload = {
      title: form.title,
      description: form.description,
      startTime: toIsoUtc(form.startTime),
      endTime: toIsoUtc(form.endTime),
      timeZone: form.timeZone,
      location: form.location || (form.zoomLink ? form.zoomLink : ""),
      isRecurring: form.recurrence !== "none",
      calendarType: "GROUP",
      visibility: "PRIVATE",
      courseName: selectedCourse ? selectedCourse.title : "",
      userRole: currentRole // Include user role in payload
    };

    console.log("Payload being sent:", payload);
    console.log("User role:", currentRole);
    console.log("JWT token role (if any):", decodedToken?.role || decodedToken?.userRole || "No role in token");

    if (editIndex !== null) {
      // Update event in backend
      try {
        const token = getAuthToken();
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/calendar/events/${form.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "X-User-Role": currentRole, // Add role in header as well
          },
          body: JSON.stringify(payload),
          credentials: "include"
        });
        // Refetch events after updating
        const data = await getAllEvents();
        console.log("Fetched events after update:", data);
        setEvents(data);
      } catch (err) {
        console.error("Failed to update event", err);
      }
      setEditIndex(null);
    } else {
      // Send to backend only on add
      try {
        const token = getAuthToken();
        const postRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/calendar/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "X-User-Role": currentRole, // Add role in header as well
          },
          body: JSON.stringify(payload),
          credentials: "include"
        });
        const postData = await postRes.json();
        console.log("POST response:", postData);
        
        // Check if it's a role-related error
        if (postRes.status === 403 && postData.message?.includes('Access restricted to admin, instructor roles')) {
          console.error("Role verification failed. Backend expects role in JWT token but token doesn't contain role information.");
          alert("Permission Error: Your account role cannot be verified by the server. Please contact support to ensure your instructor role is properly configured in the system.");
          return;
        }
        
        // Refetch events after adding
        const data = await getAllEvents();
        console.log("Fetched events after add:", data);
        // Normalize course_id to courseId for all events
        const normalizedEvents = data.map(ev => ({
          ...ev,
          courseId: ev.courseId || ev.course_id // fallback to course_id if courseId is missing
        }));
        setEvents(normalizedEvents);
      } catch (err) {
        // Optionally handle error
        console.error("Failed to add event to backend", err);
        alert("Failed to create event. Please try again or contact support if the issue persists.");
      }
    }
    
    setShowModal(false);
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const handleYearChange = (e) => {
    setCalendarYear(Number(e.target.value));
  };

  // Helper: get events for a specific date
  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(ev => {
      const evDate = new Date(ev.date);
      return (
        evDate.getFullYear() === date.getFullYear() &&
        evDate.getMonth() === date.getMonth() &&
        evDate.getDate() === date.getDate()
      );
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Calendar</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Role:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            userRole === 'admin' ? 'bg-red-100 text-red-800' :
            userRole === 'instructor' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {userRole || 'Loading...'}
          </span>
          {userRole && userRole !== 'admin' && userRole !== 'instructor' && (
            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
              Read-only access
            </span>
          )}
        </div>
      </div>
      
      {/* Role Verification Warning */}
      {(() => {
        const token = decodeToken();
        if (token && !token.role && !token.userRole && (userRole === 'admin' || userRole === 'instructor')) {
          return (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Role Verification Issue
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Your account shows you have <strong>{userRole}</strong> permissions, but the server cannot verify this. 
                      You may experience permission errors when creating events. Please contact support to resolve this issue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={handlePrevMonth} 
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold text-gray-700">
            {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long' })} {calendarYear}
          </h3>
          <select 
            value={calendarYear} 
            onChange={handleYearChange} 
            className="px-3 py-1 border rounded-lg bg-white text-sm"
          >
            {(() => {
              const thisYear = new Date().getFullYear();
              return Array.from({ length: 10 }, (_, i) => thisYear + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ));
            })()}
          </select>
        </div>
        
        <button 
          onClick={handleNextMonth} 
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-8">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center font-medium text-gray-500 text-sm py-2">{d}</div>
        ))}
        {calendarDays.map((date, idx) => {
          const eventsForDate = getEventsForDate(date);
          const isToday = date && date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={idx}
              className={`min-h-16 p-1 flex flex-col items-center border rounded-lg relative 
                ${date ? "hover:bg-blue-50 cursor-pointer" : "bg-gray-50 cursor-default"}
                ${isToday ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}
              onClick={() => date && handleDateClick(date)}
            >
              <span className={`text-sm ${isToday ? "font-bold text-blue-600" : "text-gray-700"}`}>
                {date ? date.getDate() : ""}
              </span>
              {eventsForDate.length > 0 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {eventsForDate.map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Events List */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">Upcoming Events</h3>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2">No events scheduled yet</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {events.map((event, i) => (
              <li key={event.id || i} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">{event.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {event.courseId && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mb-1">
                        {courses.find(c => c.id === event.courseId)?.title || event.courseId}
                      </span>
                    )}
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 hover:underline text-xs"
                        onClick={() => handleEdit(i)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline text-xs"
                        onClick={() => handleDelete(i)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-gray-500 space-x-4">
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleTimeString()}
                  </span>
                  {event.recurrence && (
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {event.recurrence}
                    </span>
                  )}
                </div>
                {event.location && (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Schedule New Event</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title*</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter event title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link* <span className="text-xs text-gray-400">(Enter the meeting URL)</span></label>
                    <input
                      type="url"
                      name="description"
                      value={form.description}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://meet.google.com/abc-defg-hij or https://zoom.us/j/123456789"
                      required
                    />
                    {form.description && !isValidUrl(form.description) && (
                      <p className="text-xs text-red-500 mt-1">Please enter a valid URL (e.g., https://meet.google.com/...)</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time*</label>
                      <input
                        type="datetime-local"
                        name="startTime"
                        value={form.startTime}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time*</label>
                      <input
                        type="datetime-local"
                        name="endTime"
                        value={form.endTime}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone*</label>
                    <input
                      type="text"
                      name="timeZone"
                      value={form.timeZone}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 cursor-not-allowed"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Timezone can be changed in your profile settings
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Physical location or meeting platform"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Related Course</label>
                    <select
                      name="courseId"
                      value={form.courseId}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
                    <select
                      name="recurrence"
                      value={form.recurrence}
                      onChange={(e) => {
                        setForm(prev => ({
                          ...prev,
                          recurrence: e.target.value,
                          isRecurring: e.target.value !== "none"
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="none">Does not repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Past Date Warning Modal */}
      {showPastDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setShowPastDateModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mt-3">Cannot Schedule Event</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>You can't add an event on a past date.</p>
                <p>Please select today's date or a future date.</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setShowPastDateModal(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEvent;
