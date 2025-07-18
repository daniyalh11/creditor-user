import React, { useRef, useState } from 'react';
import { allowedScormUserIds } from "@/data/allowedScormUsers";
import { currentUserId } from "@/data/currentUser";

// Dummy data for courses and modules
const dummyCourses = [
  {
    id: 'course-1',
    name: 'Complete React Developer in 2023',
    description: 'Learn React from scratch with hooks, Redux, and more',
    modules: [
      { id: 'mod1', name: 'Introduction to React' },
      { id: 'mod2', name: 'React Hooks Fundamentals' },
      { id: 'mod3', name: 'State Management with Redux' },
    ],
  },
  {
    id: 'course-2',
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
      [moduleId]: { ...prev[moduleId], file, previewUrl: null, error: '' }
    }));
  };

  const handleDescriptionChange = (moduleId, event) => {
    const description = event.target.value;
    setScormUploadState((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], description }
    }));
  };

  const handlePublish = async (moduleId) => {
    console.log("handle publish working");
    
    const { file, description } = scormUploadState[moduleId] || {};
    if (!file || !description) {
      setScormUploadState(prev => ({
        ...prev,
        [moduleId]: { ...prev[moduleId], error: "File and description required" }
      }));
      return;
    }
    const { courseId } = activeModule; // <-- get the correct courseId
    const formData = new FormData();
    formData.append("course_id", courseId); // <-- send the real course ID
    formData.append("module_id", moduleId); // <-- optional, if you want to track module
    formData.append("description", description);
    formData.append("scorm_package", file);
    formData.append("uploaded_by", "03d5a951-6de5-4753-bcd4-bab106b0f806");

    try {
          console.log(formData);
      // Assuming API_BASE_URL is defined elsewhere or needs to be imported
      const API_BASE_URL = "http://localhost:9000/api"; // Placeholder for backend URL
      const res = await fetch(`${API_BASE_URL}/scorm/upload_scorm`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ2Yjc2OWMxLTNjMTEtNDBkZC05ODM4LTVhMGUzZTU4ODEwZSIsImVtYWlsIjoiZGVlcHJhakBjcmVkaXRvcmFjYWRlbXkuY29tIiwiaWF0IjoxNzUyODAwMTI1LCJleHAiOjE3NTUzOTIxMjV9.S-R9DqNw9loIB_tsLuQwbXpIq9f2NnFKLBd2SDXJAJk`,
        },
        body: formData,
      });
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(`Upload failed: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      console.log("Success response:", data);
      
      setScormUploadState(prev => ({
        ...prev,
        [moduleId]: { ...prev[moduleId], previewUrl: data.previewUrl, error: "" }
      }));
    } catch (err) {
      setScormUploadState(prev => ({
        ...prev,
        [moduleId]: { ...prev[moduleId], error: err.message }
      }));
    }
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
                            <div>
                              <input type="file" accept=".zip" onChange={e => handleFileChange(mod.id, e)} />
                              <input
                                type="text"
                                placeholder="Description"
                                value={scormUploadState[mod.id]?.description || ""}
                                onChange={e => handleDescriptionChange(mod.id, e)}
                              />
                              <button onClick={() => handlePublish(mod.id)}>Publish</button>
                              {scormUploadState[mod.id]?.previewUrl && (
                                <iframe
                                  src={scormUploadState[mod.id].previewUrl}
                                  className="w-full h-96"
                                  title="SCORM Preview"
                                  sandbox="allow-scripts allow-same-origin"
                                />
                              )}
                              {scormUploadState[mod.id]?.error && (
                                <div className="text-red-600">{scormUploadState[mod.id].error}</div>
                              )}
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