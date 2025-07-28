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
    thumbnail: "",
    courses: []
  });
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastUpdateRequest, setLastUpdateRequest] = useState(null);
  const [lastUpdateResponse, setLastUpdateResponse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const catalogsPerPage = 4;

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
    const { name, value, checked } = e.target;
    console.log('Form change:', name, value);
    
    if (name === "courses") {
      const courseId = value;
      setForm(prev => ({
        ...prev,
        courses: checked
          ? [...prev.courses, courseId]
          : prev.courses.filter(id => id !== courseId)
      }));
    } else {
      setForm(prev => {
        const newForm = { ...prev, [name]: value };
        console.log('Updated form state:', newForm);
        return newForm;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description) {
      setFormError("Name and description are required.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const catalogData = {
        name: form.name,
        description: form.description,
      };
      if (form.thumbnail && form.thumbnail.trim() !== '') {
        catalogData.thumbnail = form.thumbnail;
      }
      setLastUpdateRequest({ editId, catalogData });
      let newCatalog;
      if (editId) {
        // Update existing catalog
        console.log('Updating catalog with data:', catalogData);
        newCatalog = await updateCatalog(editId, catalogData);
        console.log('Update catalog response:', newCatalog);
        setFormSuccess("Catalog updated successfully!");
      } else {
        // Create new catalog
        newCatalog = await createCatalog(catalogData);
        console.log('Create catalog response:', newCatalog);
        setFormSuccess("Catalog created successfully!");
      }
      setLastUpdateResponse(newCatalog);

      // Handle course addition separately to avoid breaking catalog creation
      if (form.courses.length > 0 && newCatalog.data?.id) {
        try {
          await addCoursesToCatalog(newCatalog.data.id, form.courses);
          console.log("Courses added successfully");
        } catch (courseError) {
          console.warn("Course addition failed, but catalog was created/updated:", courseError);
        }
      }

      // Refresh catalogs list
      const updatedCatalogs = await fetchAllCatalogs();
      console.log('Catalogs after update/create:', updatedCatalogs);
      setCatalogs(updatedCatalogs || []);

      // Reset form
      setForm({ name: "", description: "", thumbnail: "", courses: [] });
      setShowModal(false);
      setEditId(null);
    } catch (err) {
      console.error("Failed to save catalog:", err);
      setFormError((err && err.message ? err.message : "Failed to save catalog. Please try again.") + (err && err.stack ? "\n" + err.stack : ""));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (catalog) => {
    // Always sync form state with latest catalog data
    setForm({
      name: catalog.name || "",
      description: catalog.description || "",
      thumbnail: catalog.thumbnail || "",
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
  const totalPages = Math.ceil(safeCatalogs.length / catalogsPerPage);
  const paginatedCatalogs = safeCatalogs.slice((currentPage - 1) * catalogsPerPage, currentPage * catalogsPerPage);

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
            setForm({ name: "", description: "", thumbnail: "", courses: [] }); 
            setFormError("");
            setFormSuccess("");
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
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {paginatedCatalogs.map((catalog) => (
              <div key={catalog.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
                <div className="flex">
                  <div className="w-1/3">
                    <img
                      src={catalog.thumbnail || PLACEHOLDER_IMAGE}
                      alt={catalog.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
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
          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              className="px-4 py-2 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button
              className="px-4 py-2 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl sm:max-w-2xl w-full relative mx-4">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => { setShowModal(false); setEditId(null); }}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6 max-h-[90vh] overflow-y-auto">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Image URL</label>
                    <input
                      type="url"
                      name="thumbnail"
                      value={form.thumbnail}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    {form.thumbnail && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-2">Preview:</p>
                        <img
                          src={form.thumbnail}
                          alt="Thumbnail preview"
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500" style={{display: 'none'}}>
                          Invalid URL
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Paste the URL of an image to use as the catalog thumbnail</p>
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
      {/* Debug Panel - Only show in development */}
      {process.env.NODE_ENV === 'development' && (lastUpdateRequest || lastUpdateResponse) && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info (Development Only)</h3>
          {lastUpdateRequest && (
            <details className="text-xs mb-2" open>
              <summary className="cursor-pointer text-yellow-700">Last Update Request</summary>
              <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto max-h-40">
                {JSON.stringify(lastUpdateRequest, null, 2)}
              </pre>
            </details>
          )}
          {lastUpdateResponse && (
            <details className="text-xs" open>
              <summary className="cursor-pointer text-yellow-700">Last Update Response</summary>
              <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto max-h-40">
                {JSON.stringify(lastUpdateResponse, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default AddCatelog;