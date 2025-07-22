import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BackButton from "@/components/navigation/BackButton";
// import ChatbotContainer from "@/components/layout/ChatbotContainer";

export function DashboardLayout() {
  const location = useLocation();
  
  // Only show back button on specific pages where navigation back makes sense
  const pathsWithBackButton = [
    "/profile",
    "/faqs",
    "/support",
    "/guides",
    "/support/ticket", 
    "/privacy",
    "/avatar-picker"
  ];
  
  const showBackButton = pathsWithBackButton.some(path => location.pathname.startsWith(path));

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-white">
      {/* Sidebar - fixed on the left */}
      <div className="fixed top-0 left-0 h-screen z-30">
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: '17rem' }}>
        {/* Header - sticky at the top */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-16">
          <DashboardHeader />
        </header>
        
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {showBackButton && (
              <div className="px-6 pt-6">
                <BackButton />
              </div>
            )}
            <motion.main 
              className="p-6 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Outlet />
            </motion.main>
          </div>
        </div>
      </div>
      
      {/* Floating chatbot - fixed position in viewport */}
      {/**
      <div className="fixed bottom-4 right-4 z-50">
        <ChatbotContainer />
      </div>
      */}
    </div>
  );
}

export default DashboardLayout;