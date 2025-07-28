import React, { useState, useEffect } from "react";
import { 
  fetchAllCatalogs, 
  createCatalog, 
  updateCatalog, 
  deleteCatalog, 
  addCoursesToCatalog, 
  removeCoursesFromCatalog,
  fetchAvailableCourses 
} from "@/services/instructorCatalogService";


const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000";

const AddCatelog = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    thumbnail: null,
    courses: []
  });
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailWarning, setThumbnailWarning] = useState("");

  // Fetch catalogs and courses on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catalogsData, coursesData] = await Promise.all([
          fetchAllCatalogs(),
          fetchAvailableCourses()
        ]);
        console.log('Fetched catalogsData:', catalogsData); // Debug log
        console.log('Catalogs data type:', typeof catalogsData);
        console.log('Is catalogs array:', Array.isArray(catalogsData));
        
        // Ensure catalogs is always an array
        const catalogsArray = Array.isArray(catalogsData) ? catalogsData : [];
        console.log('Final catalogs array:', catalogsArray);
        
        setCatalogs(catalogsArray);
        setAvailableCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load catalogs and courses. Please try again later.\n" + (err.message || ''));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFormChange = (e) => {
    const { name, value, checked, files } = e.target;
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
      setThumbnailWarning("Thumbnail upload is not supported yet. Please leave this empty.");
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description) {
      setFormError("Name and description are required.");
      return;
    }
    if (form.thumbnail) {
      setThumbnailWarning("Thumbnail upload is not supported yet. Please remove the image.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const catalogData = {
        name: form.name,
        description: form.description,
        // thumbnail: form.thumbnail, // Do NOT send thumbnail
      };

      let newCatalog;
      if (editId) {
        newCatalog = await updateCatalog(editId, catalogData);
        setFormSuccess("Catalog updated successfully!");
      } else {
        newCatalog = await createCatalog(catalogData);
        setFormSuccess("Catalog created successfully!");
      }

      // Handle course addition separately to avoid breaking catalog creation
      if (form.courses.length > 0 && newCatalog.data?.id) {
        try {
          await addCoursesToCatalog(newCatalog.data.id, form.courses);
          console.log("Courses added successfully");
        } catch (courseError) {
          console.warn("Course addition failed, but catalog was created:", courseError);
          // Don't fail the entire operation, just log the warning
        }
      }

      // Refresh catalogs list
      const updatedCatalogs = await fetchAllCatalogs();
      setCatalogs(updatedCatalogs || []);
      
      // Reset form
      setForm({ name: "", description: "", thumbnail: null, courses: [] });
      setShowModal(false);
      setEditId(null);
      setThumbnailWarning("");
    } catch (err) {
      console.error("Failed to save catalog:", err);
      setFormError((err && err.message ? err.message : "Failed to save catalog. Please try again.") + (err && err.stack ? "\n" + err.stack : ""));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (catalog) => {
    setForm({
      name: catalog.name || "",
      description: catalog.description || "",
      thumbnail: null,
      courses: catalog.courses?.map(c => c.id || c) || []
    });
    setEditId(catalog.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this catalog?")) {
      try {
        await deleteCatalog(id);
        setCatalogs(catalogs => catalogs.filter(cat => cat.id !== id));
        setFormSuccess("Catalog deleted successfully!");
      } catch (err) {
        console.error("Failed to delete catalog:", err);
        setFormError(err.message || "Failed to delete catalog. Please try again.");
      }
    }
  };

  // Fallback to ensure catalogs is always an array
  const safeCatalogs = Array.isArray(catalogs) ? catalogs : [];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading catalogs...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Course Catalogs</h2>
        <button
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => { 
            setShowModal(true); 
            setEditId(null); 
            setForm({ name: "", description: "", thumbnail: null, courses: [] }); 
            setFormError("");
            setFormSuccess("");
            setThumbnailWarning("");
          }}
        >
          Add New Catalog
        </button>
      </div>

      {formSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{formSuccess}</p>
        </div>
      )}

      {safeCatalogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No catalogs found</h3>
            <p className="mt-2 text-gray-500">Create your first catalog to organize your courses.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {safeCatalogs.map((catalog) => (
            <div key={catalog.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
              <div className="flex">
                <div className="w-1/3">
                  <img
                    src={catalog.thumbnail || PLACEHOLDER_IMAGE}
                    alt={catalog.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-2/3 p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{catalog.name}</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(catalog)}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                        aria-label="Edit"
                        title="Edit catalog"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(catalog.id)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                        aria-label="Delete"
                        title="Delete catalog"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{catalog.description}</p>
                  
                  {/* Catalog metadata */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {catalog.courses?.length || 0} courses
                    </span>
                    {catalog.category && (
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {catalog.category}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-auto">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Included Courses</div>
                    <ul className="space-y-1 max-h-20 overflow-y-auto">
                      {(!catalog.courses || catalog.courses.length === 0) ? (
                        <li className="text-xs text-gray-400 italic">No courses added</li>
                      ) : (
                        catalog.courses.slice(0, 3).map(course => (
                          <li key={course.id || course} className="text-sm text-gray-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="truncate">{course.title || course.name || course.id || course}</span>
                          </li>
                        ))
                      )}
                      {catalog.courses && catalog.courses.length > 3 && (
                        <li className="text-xs text-gray-500 italic">
                          +{catalog.courses.length - 3} more courses
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                    {thumbnailWarning && (
                      <p className="text-red-500 text-xs mt-2">{thumbnailWarning}</p>
                    )}
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
                  {availableCourses.length === 0 ? (
                    <p className="text-gray-500 text-sm">No courses available. Please create some courses first.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {availableCourses.map(course => (
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
                  )}
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
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {editId ? "Saving..." : "Creating..."}
                      </div>
                    ) : (
                      editId ? "Save Changes" : "Create Catalog"
                    )}
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