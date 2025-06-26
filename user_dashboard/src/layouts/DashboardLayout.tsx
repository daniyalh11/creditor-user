import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import { motion } from "framer-motion";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BackButton from "@/components/navigation/BackButton";
import ChatbotContainer from "@/components/layout/ChatbotContainer";

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
      {/* Sidebar – participates in flex layout; it is sticky inside the component */}
      <Sidebar />
      
      {/* Main column */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header – stays at top of the column */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-16">
          <DashboardHeader />
        </header>
        
        {/* Scrollable content */}
        <div className="flex-1 overflow-auto">
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
      
      {/* Floating chatbot */}
      <ChatbotContainer />
    </div>
  );
}

export default DashboardLayout;
