import React, { useState, useEffect } from "react";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000";

const PAGE_SIZE = 3;

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
    course_level: "BEGINNER",
    courseType: "SEQUENTIAL",
    lockModules: "LOCKED",
    price: "",
    requireFinalQuiz: true,
    thumbnail: ""
  });
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:9000/api/getAllCourses");
        const response = await res.json();
        if (response.success) {
          setCourses(response.data);
        } else {
          setError("Failed to fetch courses");
        }
      } catch (err) {
        setError("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "thumbnail" && files && files[0]) {
      setForm((prev) => ({ ...prev, thumbnail: files[0] }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Required fields check
    if (!form.title || !form.estimated_duration || !form.price) {
      setFormError("Title, duration, and price are required.");
      setSuccess(false);
      return;
    }
    setFormError("");
    setSuccess(false);
    setApiResponse(null);

    // Prepare payload
    const payload = {
      title: form.title,
      description: form.description,
      learning_objectives: form.learning_objectives
        ? form.learning_objectives.split("\n").map((s) => s.trim()).filter(Boolean)
        : [],
      isHidden: form.isHidden,
      course_status: form.course_status,
      estimated_duration: form.estimated_duration,
      max_students: form.max_students ? Number(form.max_students) : undefined,
      course_level: form.course_level,
      courseType: form.courseType,
      lockModules: form.lockModules,
      price: form.price,
      requireFinalQuiz: form.requireFinalQuiz,
      // created_at, updated_at, createdBy, updatedBy will be set by backend
    };

    // If thumbnail is a file, handle file upload (not implemented here)
    // If you want to support file upload, use FormData and adjust backend accordingly

    try {
      const res = await fetch("http://localhost:9000/api/course/createCourse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });
      console.log(res);
      const data = await res.json();
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
          course_level: "BEGINNER",
          courseType: "SEQUENTIAL",
          lockModules: "LOCKED",
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

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    (course.description || "").toLowerCase().includes(search.toLowerCase())
  );
  const paginatedCourses = filteredCourses.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const hasPrev = page > 0;
  const hasNext = (page + 1) * PAGE_SIZE < filteredCourses.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl font-semibold">Courses</h2>
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search courses..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
          onClick={() => setShowModal(true)}
        >
          Create Course
        </button>
      </div>

      {apiResponse && (
        <div className={`mb-4 p-3 rounded ${apiResponse.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {apiResponse.message}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading courses...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {paginatedCourses.map((course) => (
              <div key={course.id} className="flex flex-col border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow">
                <img
                  src={course.thumbnail ? course.thumbnail : PLACEHOLDER_IMAGE}
                  alt={course.title}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">{course.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">{course.description}</p>
                  <div className="mt-auto space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Status: {course.course_status}</span>
                      <span>${course.price}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Duration: {course.estimated_duration}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredCourses.length > PAGE_SIZE && (
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => setPage(page - 1)}
                disabled={!hasPrev}
              >
                Previous
              </button>
              <button
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => setPage(page + 1)}
                disabled={!hasNext}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Level</label>
                  <select
                    name="course_level"
                    value={form.course_level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCE">Advance</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
                  <select
                    name="courseType"
                    value={form.courseType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="SEQUENTIAL">Sequential</option>
                    <option value="OPEN">Open</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lock Modules</label>
                  <select
                    name="lockModules"
                    value={form.lockModules}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="LOCKED">Locked</option>
                    <option value="UNLOCKED">Unlocked</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image (not implemented)</label>
                <input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  disabled
                />
                <span className="text-xs text-gray-400">(File upload not supported in this demo)</span>
              </div>
              {formError && <div className="text-sm text-red-600 py-2">{formError}</div>}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;