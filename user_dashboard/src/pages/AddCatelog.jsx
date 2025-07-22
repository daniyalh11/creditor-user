import React, { useState } from "react";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000";
const dummyCourses = [
  { id: "course-1", title: "JavaScript for Beginners" },
  { id: "course-2", title: "Advanced PostgreSQL" },
  { id: "course-3", title: "React Mastery" }
];

const initialCatelogs = [
  {
    id: "catelog-1",
    name: "Programming",
    description: "All programming related courses.",
    thumbnail: null,
    courses: ["course-1", "course-3"]
  },
  {
    id: "catelog-2",
    name: "Database",
    description: "Database and SQL courses.",
    thumbnail: null,
    courses: ["course-2"]
  }
];

const AddCatelog = () => {
  const [catelogs, setCatelogs] = useState(initialCatelogs);
  const [form, setForm] = useState({
    name: "",
    description: "",
    thumbnail: null,
    courses: []
  });
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleFormChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "courses") {
      const courseId = value;
      setForm(prev => ({
        ...prev,
        courses: checked
          ? [...prev.courses, courseId]
          : prev.courses.filter(id => id !== courseId)
      }));
    } else if (name === "thumbnail" && files && files[0]) {
      setForm(prev => ({ ...prev, thumbnail: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.description) {
      setFormError("Name and description are required.");
      return;
    }
    if (editId) {
      setCatelogs(catelogs => catelogs.map(cat =>
        cat.id === editId
          ? {
              ...cat,
              name: form.name,
              description: form.description,
              thumbnail: form.thumbnail ? URL.createObjectURL(form.thumbnail) : cat.thumbnail,
              courses: form.courses
            }
          : cat
      ));
    } else {
      setCatelogs([
        {
          id: `catelog-${catelogs.length + 1}`,
          name: form.name,
          description: form.description,
          thumbnail: form.thumbnail ? URL.createObjectURL(form.thumbnail) : null,
          courses: form.courses
        },
        ...catelogs
      ]);
    }
    setForm({ name: "", description: "", thumbnail: null, courses: [] });
    setShowModal(false);
    setFormError("");
    setEditId(null);
  };

  const handleEdit = (catelog) => {
    setForm({
      name: catelog.name,
      description: catelog.description,
      thumbnail: null,
      courses: catelog.courses
    });
    setEditId(catelog.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this catalog?")) {
      setCatelogs(catelogs => catelogs.filter(cat => cat.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Course Catalogs</h2>
        <button
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => { setShowModal(true); setEditId(null); setForm({ name: "", description: "", thumbnail: null, courses: [] }); }}
        >
          Add New Catalog
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {catelogs.map((catelog) => (
          <div key={catelog.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
            <div className="flex">
              <div className="w-1/3">
                <img
                  src={catelog.thumbnail ? catelog.thumbnail : PLACEHOLDER_IMAGE}
                  alt={catelog.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-2/3 p-5 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{catelog.name}</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(catelog)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      aria-label="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(catelog.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      aria-label="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{catelog.description}</p>
                <div className="mt-auto">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Included Courses</div>
                  <ul className="space-y-1">
                    {catelog.courses.length === 0 ? (
                      <li className="text-xs text-gray-400 italic">No courses added</li>
                    ) : (
                      catelog.courses.map(cid => (
                        <li key={cid} className="text-sm text-gray-700 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {dummyCourses.find(c => c.id === cid)?.title || cid}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative mx-4">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => { setShowModal(false); setEditId(null); }}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{editId ? "Edit Catalog" : "Create New Catalog"}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catalog Name*</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. Programming Fundamentals"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Image</label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer">
                        <span className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors inline-block">
                          Choose File
                        </span>
                        <input
                          type="file"
                          name="thumbnail"
                          accept="image/*"
                          onChange={handleFormChange}
                          className="hidden"
                        />
                      </label>
                      {form.thumbnail && (
                        <span className="text-sm text-gray-500 truncate">{form.thumbnail.name}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description*</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe what this catalog contains..."
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Courses</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dummyCourses.map(course => (
                      <label key={course.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          name="courses"
                          value={course.id}
                          checked={form.courses.includes(course.id)}
                          onChange={handleFormChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{course.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {formError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {formError}
                  </div>
                )}
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditId(null); }}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {editId ? "Save Changes" : "Create Catalog"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCatelog;