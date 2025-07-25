import React from "react";
import CreateCourse from "./CreateCourse";
import ScormPage from "./ScormPage";
import AddEvent from "./AddEvent";
import AddCatelog from "./AddCatelog";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const Instructorpage = () => {
  // Check userRole from localStorage
  const userRole = localStorage.getItem('userRole');
  const isAllowed = userRole === 'instructor' || userRole === 'admin';

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-yellow-50 border-l-8 border-yellow-400 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-6 w-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-yellow-800 mb-1">Access Restricted</h3>
                <p className="text-yellow-700">
                  This page is only accessible to authorized instructors or admins. Please contact support if you believe this is an error.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="mt-4 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar with subtle shadow and z-index */}
      <div className="fixed top-0 left-0 h-screen w-[17rem] bg-white border-r border-gray-200 z-20 shadow-sm">
        <Sidebar />
      </div>
      {/* Main content area */}
      <div className="flex-1 ml-[17rem]">
        {/* Sticky header with subtle shadow */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <DashboardHeader />
        </div>
        {/* Main content with improved spacing and visual hierarchy */}
        <main className="max-w-6xl mx-auto px-6 py-8 space-y-12 pt-8">
          {/* Dashboard header section */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Instructor Dashboard</h1>
            <p className="text-gray-600">Manage your courses, content, and events</p>
          </section>
          {/* Course creation section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Course Management
              </h2>
            </div>
            <div className="p-6">
              <CreateCourse />
            </div>
          </section>
          {/* Catalog management section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Course Catalogs
              </h2>
            </div>
            <div className="p-6">
              <AddCatelog />
            </div>
          </section>
          {/* SCORM content section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                SCORM Content
              </h2>
            </div>
            <div className="p-6">
              <ScormPage />
            </div>
          </section>
          {/* Event management section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Event Management
              </h2>
            </div>
            <div className="p-6">
              <AddEvent />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Instructorpage;
