import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Mail, BellDot } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import NotificationModal from "./NotificationModal";
import InboxModal from "./InboxModal";
import CalendarModal from "./CalendarModal";

export function DashboardHeader() {
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [inboxModalOpen, setInboxModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/95">
      <div className="container h-16 flex items-center justify-between px-6">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Athena LMS
          </h1>
        </Link>
        
        {/* Center - Enhanced Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search courses, lessons, or topics..."
              className="pl-12 pr-4 py-3 w-full bg-gray-50 border-0 rounded-2xl 
                         focus:bg-white focus:ring-2 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-offset-0
                         transition-all duration-200 text-sm h-12 shadow-sm"
            />
          </div>
        </div>

        {/* Right - Enhanced Icons and Profile */}
        <div className="flex items-center gap-3">
          {/* Calendar Icon */}
          <Button 
            size="icon" 
            variant="ghost" 
            className="relative text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 h-10 w-10 rounded-xl"
            onClick={() => setCalendarModalOpen(true)}
          >
            <Calendar className="h-5 w-5" />
          </Button>

          {/* Messages Icon */}
          <Button 
            size="icon" 
            variant="ghost" 
            className="relative text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 h-10 w-10 rounded-xl"
            onClick={() => setInboxModalOpen(true)}
          >
            <Mail className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
          </Button>
          
          {/* Notifications */}
          <Button 
            size="icon" 
            variant="ghost" 
            className="relative text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 h-10 w-10 rounded-xl"
            onClick={() => setNotificationModalOpen(true)}
          >
            <BellDot className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white shadow-sm animate-pulse"></div>
          </Button>
          
          {/* Profile Dropdown */}
          <div className="ml-2">
            <ProfileDropdown />
          </div>
        </div>
      </div>
      
      {/* Calendar Modal */}
      <CalendarModal 
        open={calendarModalOpen} 
        onOpenChange={setCalendarModalOpen} 
      />
      
      {/* Notification Modal */}
      <NotificationModal 
        open={notificationModalOpen} 
        onOpenChange={setNotificationModalOpen} 
      />
      
      {/* Inbox Modal */}
      <InboxModal 
        open={inboxModalOpen} 
        onOpenChange={setInboxModalOpen} 
      />
    </header>
  );
}

export default DashboardHeader;