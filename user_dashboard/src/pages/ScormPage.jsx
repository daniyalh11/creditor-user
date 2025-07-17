import React, { useRef, useState } from 'react';
import { allowedScormUserIds } from "@/data/allowedScormUsers";
import { currentUserId } from "@/data/currentUser";

// Dummy data for courses and modules
const dummyCourses = [
  {
    id: 'react-2023',
    name: 'Complete React Developer in 2023',
    description: 'Learn React from scratch with hooks, Redux, and more',
    modules: [
      { id: 'mod1', name: 'Introduction to React' },
      { id: 'mod2', name: 'React Hooks Fundamentals' },
      { id: 'mod3', name: 'State Management with Redux' },
    ],
  },
  {
    id: 'node-backend',
    name: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js and Express',
    modules: [
      { id: 'mod1', name: 'Node.js Basics' },
      { id: 'mod2', name: 'Express Routing' },
    ],
  },
];

const ScormPage = () => {
  const fileInputRef = useRef(null);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [scormUploadState, setScormUploadState] = useState({});
  const [activeModule, setActiveModule] = useState(null);

  const isAllowed = allowedScormUserIds.includes(currentUserId);

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
      [moduleId]: { ...prev[moduleId], file, uploaded: false, error: '' },
    }));
  };

  const handleUpload = (moduleId) => {
    setScormUploadState((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], uploading: true, error: '' },
    }));
    setTimeout(() => {
      setScormUploadState((prev) => ({
        ...prev,
        [moduleId]: { 
          ...prev[moduleId], 
          uploading: false, 
          uploaded: true,
          // In a real app, this would be the actual URL from your server
          previewUrl: "https://example.com/scorm-preview" 
        },
      }));
    }, 1200);
  };

  const handlePublish = (moduleId) => {
    setScormUploadState((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], published: true },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">SCORM Content Management</h1>
        <p className="text-gray-600">Manage and upload SCORM packages for your course modules</p>
      </div>

      {!isAllowed ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This page is only accessible to authorized users.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {dummyCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div
                className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleExpandCourse(course.id)}
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{course.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                    ID: {course.id}
                  </span>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedCourseId === course.id ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>

              {expandedCourseId === course.id && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="space-y-4">
                    {course.modules.map((mod) => {
                      const uploadState = scormUploadState[mod.id] || {};
                      const isActive = activeModule && activeModule.courseId === course.id && activeModule.moduleId === mod.id;
                      return (
                        <div key={mod.id} className="bg-gray-50 rounded-md p-4 border border-gray-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium text-gray-800">{mod.name}</h3>
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
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload SCORM Zip File
                                  </label>
                                  <div className="flex items-center">
                                    <input
                                      type="file"
                                      accept=".zip"
                                      onChange={e => handleFileChange(mod.id, e)}
                                      className="hidden"
                                      id={`file-upload-${mod.id}`}
                                    />
                                    <label
                                      htmlFor={`file-upload-${mod.id}`}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                                    >
                                      Choose file
                                    </label>
                                    {uploadState.file && (
                                      <span className="ml-3 text-sm text-gray-600 truncate max-w-xs">
                                        {uploadState.file.name}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => handleUpload(mod.id)}
                                    disabled={!uploadState.file || uploadState.uploading || uploadState.uploaded}
                                    className={`px-4 py-2 rounded-md text-sm font-medium text-white ${uploadState.uploading ? 'bg-blue-400' : uploadState.uploaded ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${(!uploadState.file || uploadState.uploading || uploadState.uploaded) ? 'cursor-not-allowed' : ''}`}
                                  >
                                    {uploadState.uploading ? (
                                      <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                      </span>
                                    ) : uploadState.uploaded ? 'Uploaded' : 'Upload'}
                                  </button>

                                  {uploadState.uploaded && !uploadState.published && (
                                    <button
                                      onClick={() => handlePublish(mod.id)}
                                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                      Publish
                                    </button>
                                  )}

                                  {uploadState.published && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                      <svg className="-ml-1 mr-1.5 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                                        <circle cx="4" cy="4" r="3" />
                                      </svg>
                                      Published
                                    </span>
                                  )}
                                </div>

                                {/* SCORM Preview Section */}
                                {uploadState.uploaded && !uploadState.published && uploadState.previewUrl && (
                                  <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">SCORM Preview</h4>
                                    <div className="border border-gray-200 rounded-md overflow-hidden">
                                      <iframe 
                                        src={uploadState.previewUrl}
                                        className="w-full h-96"
                                        title="SCORM Preview"
                                        sandbox="allow-scripts allow-same-origin"
                                      />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                      This is a preview of your SCORM content. Please review before publishing.
                                    </p>
                                  </div>
                                )}

                                {uploadState.error && (
                                  <div className="text-sm text-red-600 mt-2">
                                    {uploadState.error}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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