
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import { motion } from "framer-motion";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BackButton from "@/components/navigation/BackButton";

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
    <motion.div 
      className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-50">
          {showBackButton && (
            <div className="px-6 pt-6">
              <BackButton />
            </div>
          )}
          <motion.main 
            className="flex-1 overflow-auto p-6 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </motion.div>
  );
}

export default DashboardLayout;
