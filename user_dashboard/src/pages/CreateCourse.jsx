import React, { useState, useEffect, useRef } from "react";
import { fetchAllCourses, fetchCourseModules, createModule, updateModule, deleteModule, deleteCourse } from "../services/courseService";
import { CreateModuleDialog } from "@/components/courses/CreateModuleDialog";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000";

const PAGE_SIZE = 4; // 2 rows x 2 columns

// const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQ5MTFjYWQwLTkwY2MtNGJlZS05YzJiLTE5MDU3ZTA5YzhhYyIsImVtYWlsIjoibWF1c2FtQGNyZWRpdG9yYWNhZGVteS5jb20iLCJpYXQiOjE3NTMxNTYzNTgsImV4cCI6MTc1NTc0ODM1OH0.ZDCtW9yrVeHr-oaxSxPPrNfbrX8nCG87CqWmzq55Wfg";

const CreateCourse = ({ onCourseCreated }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    learning_objectives: "",
    isHidden: false,
    course_status: "DRAFT",
    estimated_duration: "",
    max_students: 0,
    price: "",
    requireFinalQuiz: true,
    thumbnail: ""
  });
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCourseData, setEditCourseData] = useState(null);
  const editFormRef = useRef(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [courseModules, setCourseModules] = useState({});
  const [showCreateModuleDialog, setShowCreateModuleDialog] = useState(false);
  const [selectedCourseForModule, setSelectedCourseForModule] = useState(null);
  const [editModuleData, setEditModuleData] = useState(null);
  const [moduleDialogMode, setModuleDialogMode] = useState("create");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [courseUsers, setCourseUsers] = useState([]);
  const [selectedCourseForUsers, setSelectedCourseForUsers] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [showDeleteCourseConfirm, setShowDeleteCourseConfirm] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await fetchAllCourses();
        setCourses(data);
      } catch (err) {
        setError("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleViewModules = async (courseId) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      return;
    }

    setExpandedCourseId(courseId);
    
    // Fetch modules if not already loaded
    if (!courseModules[courseId]) {
      try {
        const modules = await fetchCourseModules(courseId);
        setCourseModules(prev => ({
          ...prev,
          [courseId]: modules
        }));
      } catch (err) {
        console.error('Error fetching modules:', err);
        setCourseModules(prev => ({
          ...prev,
          [courseId]: []
        }));
      }
    }
  };

  const handleCreateModule = (courseId) => {
    setSelectedCourseForModule(courseId);
    setEditModuleData(null);
    setModuleDialogMode("create");
    setShowCreateModuleDialog(true);
  };

  const handleEditModule = (courseId, module) => {
    setSelectedCourseForModule(courseId);
    setEditModuleData(module);
    setModuleDialogMode("edit");
    setShowCreateModuleDialog(true);
  };

  const handleDeleteModule = (courseId, module) => {
    setModuleToDelete({ courseId, module });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteModule = async () => {
    if (!moduleToDelete) return;
    
    try {
      const { courseId, module } = moduleToDelete;
      const moduleData = {
        title: module.title,
        description: module.description || "test description",
        order: module.order || 1,
        estimated_duration: module.estimated_duration || 60,
        module_status: module.module_status || "DRAFT",
        thumbnail: module.thumbnail || "test thumbnail"
      };
      
      await deleteModule(courseId, module.id, moduleData);
      
      // Refresh modules for the course
      const updatedModules = await fetchCourseModules(courseId);
      setCourseModules(prev => ({
        ...prev,
        [courseId]: updatedModules
      }));
      
      setShowDeleteConfirm(false);
      setModuleToDelete(null);
    } catch (err) {
      console.error('Error deleting module:', err);
      alert('Failed to delete module: ' + err.message);
    }
  };

  const handleModuleCreated = async (newModule) => {
    // Refresh modules for the specific course
    try {
      const updatedModules = await fetchCourseModules(selectedCourseForModule);
      setCourseModules(prev => ({
        ...prev,
        [selectedCourseForModule]: updatedModules
      }));
    } catch (err) {
      console.error('Error refreshing modules:', err);
    }
  };

  const handleModuleSaved = async (moduleData) => {
    if (moduleDialogMode === "edit" && editModuleData) {
      await updateModule(selectedCourseForModule, editModuleData.id, moduleData);
      await handleModuleCreated();
    } else {
      await createModule(selectedCourseForModule, moduleData);
      await handleModuleCreated();
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "thumbnail" && type === "url") {
      setForm((prev) => ({ ...prev, thumbnail: value }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.estimated_duration || !form.price) {
      setFormError("Title, duration, and price are required.");
      setSuccess(false);
      return;
    }
    setFormError("");
    setSuccess(false);
    setApiResponse(null);

    // Prepare the payload as JSON instead of FormData
    const learningObjectivesArray = form.learning_objectives
      ? form.learning_objectives.split("\n").map((s) => s.trim()).filter(Boolean)
      : [];
    
    const payload = {
      title: form.title,
      description: form.description,
      learning_objectives: learningObjectivesArray, // Send as array
      isHidden: form.isHidden,
      course_status: form.course_status,
      estimated_duration: form.estimated_duration,
      max_students: form.max_students ? Number(form.max_students) : 0,
      course_level: "BEGINNER",
      courseType: "OPEN",
      lockModules: "UNLOCKED",
      price: form.price,
      requireFinalQuiz: form.requireFinalQuiz,
      thumbnail: form.thumbnail || null
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/createCourse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log(data);
      if (res.ok && data.success) {
        setSuccess(true);
        setApiResponse({ type: "success", message: data.message, course: data.data });
        setCourses([data.data, ...courses]);
        if (onCourseCreated) {
          onCourseCreated(data.data);
        }
        setShowModal(false);
        setForm({
          title: "",
          description: "",
          learning_objectives: "",
          isHidden: false,
          course_status: "DRAFT",
          estimated_duration: "",
          max_students: 0,
          price: "",
          requireFinalQuiz: true,
          thumbnail: ""
        });
        setTimeout(() => setSuccess(false), 2000);
        setPage(0);
      } else {
        setApiResponse({ type: "error", message: data.message || "Failed to create course." });
      }
    } catch (err) {
      setApiResponse({ type: "error", message: err.message || "Failed to create course." });
    }
  };

  const handleEditClick = (course) => {
    setEditCourseData(course);
    setEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditCourseData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      const payload = { ...editCourseData };
      delete payload.id;
      // Remove any fields not needed by backend (like created_at, updated_at, etc.)
      ["created_at", "updated_at", "createdBy", "updatedBy", "deleted_at"].forEach(f => delete payload[f]);
      // Ensure thumbnail is included as a string
      if (editCourseData.thumbnail) {
        payload.thumbnail = editCourseData.thumbnail;
      }
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/editCourse/${editCourseData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update course");
      }
      // Update course in local state
      setCourses(prev => prev.map(c => c.id === editCourseData.id ? { ...c, ...editCourseData } : c));
      setEditModalOpen(false);
    } catch (err) {
      setEditError(err.message || "Failed to update course");
    } finally {
      setEditLoading(false);
    }
  };

  const handleViewUsers = async (courseId) => {
    setSelectedCourseForUsers(courseId);
    setShowUsersModal(true);
    setUsersLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/getAllUsersByCourseId`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch course users');
      }
      
      const data = await response.json();
      setCourseUsers(data.data || []);
    } catch (error) {
      console.error('Error fetching course users:', error);
      setCourseUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteCourse = (course) => {
    setCourseToDelete(course);
    setShowDeleteCourseConfirm(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      await deleteCourse(courseToDelete.id);
      setCourses(prev => prev.filter(c => c.id !== courseToDelete.id));
      setShowDeleteCourseConfirm(false);
      setCourseToDelete(null);
      setApiResponse({ type: "success", message: "Course deleted successfully" });
      setTimeout(() => setApiResponse(null), 3000);
    } catch (err) {
      console.error('Error deleting course:', err);
      setApiResponse({ type: "error", message: err.message || "Failed to delete course" });
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    (course.description || "").toLowerCase().includes(search.toLowerCase())
  );
  const paginatedCourses = filteredCourses.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const hasPrev = page > 0;
  const hasNext = (page + 1) * PAGE_SIZE < filteredCourses.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading courses</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
          <p className="text-gray-600 mt-1">Create and manage your courses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Course
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.293 7.293a1 1 0 011.414 0L9 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Course created successfully!</p>
            </div>
          </div>
        </div>
      )}

      {apiResponse && (
        <div className={`border rounded-lg p-4 ${apiResponse.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <p className={`text-sm ${apiResponse.type === "success" ? "text-green-800" : "text-red-800"}`}>
            {apiResponse.message}
          </p>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paginatedCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Duration: {course.estimated_duration}</span>
                    <span>Price: ${course.price}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.course_status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                      course.course_status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {course.course_status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewModules(course.id)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    {expandedCourseId === course.id ? 'Hide' : 'View'} Modules
                  </button>
                  <button
                    onClick={() => handleViewUsers(course.id)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  >
                    View Users
                  </button>
                  <button
                    onClick={() => handleEditClick(course)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Modules Section */}
              {expandedCourseId === course.id && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Course Modules</h4>
                    <button
                      onClick={() => handleCreateModule(course.id)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      + Add Module
                    </button>
                  </div>
                  {courseModules[course.id] ? (
                    courseModules[course.id].length > 0 ? (
                      <div className="space-y-2">
                        {courseModules[course.id].map((module) => (
                          <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <h5 className="font-medium text-gray-900">{module.title}</h5>
                              {module.description && (
                                <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">Order: {module.order || 'N/A'}</span>
                                <span className="text-xs text-gray-500">Duration: {module.estimated_duration || 0} min</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  module.module_status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                  module.module_status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {module.module_status}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              <span className="text-xs text-gray-500">ID: {module.id}</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEditModule(course.id, module)}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteModule(course.id, module)}
                                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No modules found for this course</p>
                    )
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-500">Loading modules...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {filteredCourses.length > PAGE_SIZE && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!hasPrev}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-sm text-gray-700">
            Page {page + 1} of {Math.ceil(filteredCourses.length / PAGE_SIZE)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!hasNext}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative"
               style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Course</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title*</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter course description"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Learning Objectives (one per line)</label>
                <textarea
                  name="learning_objectives"
                  value={form.learning_objectives}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Master neural network basics\nImplement deep learning models"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration*</label>
                  <input
                    type="text"
                    name="estimated_duration"
                    value={form.estimated_duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 30 mins"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 0 or 199.99"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                  <input
                    type="number"
                    name="max_students"
                    value={form.max_students}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 80"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Status</label>
                  <select
                    name="course_status"
                    value={form.course_status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isHidden"
                    checked={form.isHidden}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm">Hidden</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="requireFinalQuiz"
                    checked={form.requireFinalQuiz}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm">Require Final Quiz</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image URL</label>
                <input
                  type="url"
                  name="thumbnail"
                  value={form.thumbnail}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {form.thumbnail && (
                  <img src={form.thumbnail} alt="Preview" className="mt-2 h-24 rounded shadow" onError={(e) => e.target.style.display = 'none'} />
                )}
              </div>
              {formError && <div className="text-sm text-red-600 py-2">{formError}</div>}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Dialog */}
      {editModalOpen && editCourseData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setEditModalOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Course</h2>
            <form onSubmit={handleEditSubmit} ref={editFormRef} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title*</label>
                <input
                  type="text"
                  name="title"
                  value={editCourseData.title}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editCourseData.description}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration*</label>
                  <input
                    type="text"
                    name="estimated_duration"
                    value={editCourseData.estimated_duration}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
                  <input
                    type="number"
                    name="price"
                    value={editCourseData.price}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                  <input
                    type="number"
                    name="max_students"
                    value={editCourseData.max_students || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Status</label>
                  <select
                    name="course_status"
                    value={editCourseData.course_status}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isHidden"
                    checked={editCourseData.isHidden}
                    onChange={handleEditInputChange}
                  />
                  <span className="text-sm">Hidden</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="requireFinalQuiz"
                    checked={editCourseData.requireFinalQuiz}
                    onChange={handleEditInputChange}
                  />
                  <span className="text-sm">Require Final Quiz</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image URL</label>
                <input
                  type="url"
                  name="thumbnail"
                  value={editCourseData.thumbnail || ''}
                  onChange={handleEditInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {editCourseData.thumbnail && (
                  <img src={editCourseData.thumbnail} alt="Preview" className="mt-2 h-24 rounded shadow" onError={(e) => e.target.style.display = 'none'} />
                )}
              </div>
              {editError && <div className="text-sm text-red-600 py-2">{editError}</div>}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editLoading ? 'Updating...' : 'Update Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Module Dialog */}
      <CreateModuleDialog
        isOpen={showCreateModuleDialog}
        onClose={() => setShowCreateModuleDialog(false)}
        courseId={selectedCourseForModule}
        onModuleCreated={handleModuleCreated}
        existingModules={courseModules[selectedCourseForModule] || []}
        initialData={editModuleData}
        mode={moduleDialogMode}
        onSave={handleModuleSaved}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && moduleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Delete Module</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the module "{moduleToDelete.module.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteModule}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Confirmation Dialog */}
      {showDeleteCourseConfirm && courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Delete Course</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the course "{courseToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteCourseConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCourse}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Users Modal */}
      {showUsersModal && selectedCourseForUsers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setShowUsersModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Course Users</h2>
            
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading users...</span>
              </div>
            ) : courseUsers.length > 0 ? (
              <div className="space-y-3">
                {courseUsers.map((userData, index) => (
                  <div key={userData.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {userData.user.image ? (
                          <img src={userData.user.image} alt="User" className="w-10 h-10 rounded-full" />
                        ) : (
                          <span className="text-blue-600 font-medium">
                            {userData.user.first_name?.[0]}{userData.user.last_name?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {userData.user.first_name} {userData.user.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{userData.user.email}</p>
                        <div className="flex gap-1 mt-1">
                          {userData.user.user_roles?.map((role, roleIndex) => (
                            <span key={roleIndex} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {role.role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">ID: {userData.user_id}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No users enrolled in this course yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;