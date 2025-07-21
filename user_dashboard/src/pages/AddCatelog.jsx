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
      thumbnail: null, // Don't prefill file input
      courses: catelog.courses
    });
    setEditId(catelog.id);
    setShowModal(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Catalogs</h2>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => { setShowModal(true); setEditId(null); setForm({ name: "", description: "", thumbnail: null, courses: [] }); }}
        >
          Add Catalog
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {catelogs.map((catelog) => (
          <div key={catelog.id} className="border rounded-lg p-4 bg-gray-50 flex gap-4">
            <img
              src={catelog.thumbnail ? catelog.thumbnail : PLACEHOLDER_IMAGE}
              alt={catelog.name}
              className="w-24 h-24 object-cover rounded-md border"
            />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-lg text-gray-800">{catelog.name}</h3>
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => handleEdit(catelog)}
                >
                  Edit
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-2">{catelog.description}</p>
              <div className="text-xs text-gray-500 mb-1">Courses:</div>
              <ul className="list-disc ml-5 text-xs text-gray-700">
                {catelog.courses.length === 0 ? (
                  <li>No courses</li>
                ) : (
                  catelog.courses.map(cid => (
                    <li key={cid}>{dummyCourses.find(c => c.id === cid)?.title || cid}</li>
                  ))
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => { setShowModal(false); setEditId(null); }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{editId ? "Edit Catalog" : "Add Catalog"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catalog Name*</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter catalog name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter catalog description"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image</label>
                <input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleFormChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Add Courses</label>
                <div className="flex flex-col gap-2">
                  {dummyCourses.map(course => (
                    <label key={course.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="courses"
                        value={course.id}
                        checked={form.courses.includes(course.id)}
                        onChange={handleFormChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      {course.title}
                    </label>
                  ))}
                </div>
              </div>
              {formError && <div className="text-sm text-red-600 py-2">{formError}</div>}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditId(null); }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editId ? "Save Changes" : "Add Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCatelog; 