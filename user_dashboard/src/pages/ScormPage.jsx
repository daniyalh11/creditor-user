import React, { useRef, useState, useEffect } from 'react';
import { allowedScormUserIds } from "@/data/allowedScormUsers";
import { currentUserId } from "@/data/currentUser";
import { fetchAllCourses, fetchCourseModules } from "@/services/courseService";

const ScormPage = () => {
  const fileInputRef = useRef(null);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [scormUploadState, setScormUploadState] = useState({});
  const [activeModule, setActiveModule] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAllowed = allowedScormUserIds.includes(currentUserId);

  // Fetch courses and their modules
  useEffect(() => {
    const fetchCoursesData = async () => {
      setLoading(true);
      try {
        const coursesData = await fetchAllCourses();
        
        // Fetch modules for each course
        const coursesWithModules = await Promise.all(
          coursesData.map(async (course) => {
            try {
              const modules = await fetchCourseModules(course.id);
              return {
                ...course,
                modules: modules || []
              };
            } catch (err) {
              console.error(`Error fetching modules for course ${course.id}:`, err);
              return {
                ...course,
                modules: []
              };
            }
          })
        );
        
        setCourses(coursesWithModules);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    if (isAllowed) {
      fetchCoursesData();
    }
  }, [isAllowed]);

  const handleExpandCourse = (courseId) => {
    setExpandedCourseId(expandedCourseId === courseId ? null : courseId);
    setActiveModule(null);
  };

  const handleAddScormClick = (courseId, moduleId) => {
    setActiveModule({ courseId, moduleId });
    setScormUploadState((prev) => ({ ...prev, [moduleId]: { file: null, uploading: false, uploaded: false, error: '' } }));
  };

  const handleFileChange = (moduleId, event) => {
    const file = event.target.files[0];
    setScormUploadState((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], file, previewUrl: null, error: '' }
    }));
  };

  const handleUpload = async (moduleId) => {
    const uploadState = scormUploadState[moduleId];
    if (!uploadState?.file) return;

    setScormUploadState((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], uploading: true, error: '' }
    }));

    const formData = new FormData();
    formData.append('scormFile', uploadState.file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scorm/upload_scorm`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setScormUploadState((prev) => ({
          ...prev,
          [moduleId]: {
            ...prev[moduleId],
            uploading: false,
            uploaded: true,
            previewUrl: result.previewUrl || result.url,
            error: ''
          }
        }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setScormUploadState((prev) => ({
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          uploading: false,
          error: 'Upload failed. Please try again.'
        }
      }));
    }
  };

  if (!isAllowed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This page is only accessible to authorized SCORM users.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
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
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SCORM Content Management</h1>
        <p className="text-gray-600">Upload and manage SCORM packages for your course modules</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
          <p className="text-gray-500">Create some courses first to manage SCORM content</p>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                  </div>
                  <button
                    onClick={() => handleExpandCourse(course.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {expandedCourseId === course.id ? 'Hide Modules' : 'View Modules'}
                  </button>
                </div>
              </div>

              {expandedCourseId === course.id && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="space-y-4">
                    {course.modules.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No modules found for this course</p>
                      </div>
                    ) : (
                      course.modules.map((mod) => {
                        const uploadState = scormUploadState[mod.id] || {};
                        const isActive = activeModule && activeModule.courseId === course.id && activeModule.moduleId === mod.id;
                        return (
                          <div key={mod.id} className="bg-gray-50 rounded-md p-4 border border-gray-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium text-gray-800">{mod.title}</h3>
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                                  Module ID: {mod.id}
                                </span>
                              </div>
                              <button
                                onClick={() => handleAddScormClick(course.id, mod.id)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Add SCORM
                              </button>
                            </div>

                            {isActive && (
                              <div className="mt-4 p-4 bg-white rounded-md border border-gray-200">
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Upload SCORM Package
                                    </label>
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept=".zip"
                                      onChange={(e) => handleFileChange(mod.id, e)}
                                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                  </div>

                                  {uploadState.file && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleUpload(mod.id)}
                                        disabled={uploadState.uploading}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                      >
                                        {uploadState.uploading ? 'Uploading...' : 'Upload'}
                                      </button>
                                      <span className="text-sm text-gray-600">
                                        {uploadState.file.name}
                                      </span>
                                    </div>
                                  )}

                                  {uploadState.error && (
                                    <div className="text-red-600 text-sm">{uploadState.error}</div>
                                  )}

                                  {uploadState.uploaded && uploadState.previewUrl && (
                                    <div className="mt-4">
                                      <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                                      <iframe
                                        src={`${import.meta.env.VITE_API_BASE_URL}${uploadState.previewUrl}`}
                                        className="w-full h-64 border border-gray-300 rounded-md"
                                        title="SCORM Preview"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScormPage;