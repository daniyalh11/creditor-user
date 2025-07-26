import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Video, UserCheck, UserX, Calendar, Play, Eye, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { AttendanceViewerModal } from "./AttendanceViewerModal";
import { UpcomingLiveClasses } from "./UpcomingLiveClasses";

// Mock data for attendance and recordings
const attendanceData = [
  { date: "2025-06-08", status: "present", topic: "Constitutional Rights" },
  { date: "2025-06-05", status: "absent", topic: "Civil Procedure" },
  { date: "2025-06-03", status: "present", topic: "Criminal Law Basics" },
  { date: "2025-06-01", status: "present", topic: "Legal Research Methods" },
];

const recordedSessions = [
  {
    id: "1",
    title: "Constitutional Rights Deep Dive",
    date: "2025-06-08",
    duration: "1h 45m",
    thumbnail: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=400",
    driveLink: "https://drive.google.com/file/d/1ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg/view"
  },
  {
    id: "2",
    title: "Civil Procedure Fundamentals",
    date: "2025-06-05",
    duration: "2h 15m",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400",
    driveLink: "https://drive.google.com/file/d/2ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg/view"
  },
  {
    id: "3",
    title: "Criminal Law Case Studies",
    date: "2025-06-03",
    duration: "1h 30m",
    thumbnail: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=400",
    driveLink: "https://drive.google.com/file/d/3ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg/view"
  },
];

export function LiveClasses() {
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch today's live class from backend
    const fetchLiveClass = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const start = new Date(today.setHours(0,0,0,0)).toISOString();
        const end = new Date(today.setHours(23,59,59,999)).toISOString();
        const params = new URLSearchParams({ startDate: start, endDate: end });
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/calendar/events?${params.toString()}`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
          setLiveClass(data.data[0]); // Take the first event for today
        } else {
          setLiveClass(null);
        }
      } catch (err) {
        setLiveClass(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveClass();

    // POST request for debugging
    const postDebug = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/calendar/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ debug: true }) // Example body, adjust as needed
        });
        const postData = await response.json();
        console.log('POST /calendar/events response:', postData);
      } catch (err) {
        console.error('POST /calendar/events error:', err);
      }
    };
    postDebug();
  }, []);

  const isClassActive = !!liveClass;
  const joinLink = liveClass?.description || "";
  const classTitle = liveClass?.title || "";
  const classTime = liveClass ? `${new Date(liveClass.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${classTitle}` : "";

  // Check if class is currently in session (within start and end time)
  const isClassInSession = () => {
    if (!liveClass) return false;
    const now = new Date();
    const startTime = new Date(liveClass.startTime);
    const endTime = new Date(liveClass.endTime);
    return now >= startTime && now <= endTime;
  };

  const isCurrentlyActive = isClassInSession();

  const handleVideoClick = (driveLink) => {
    window.open(driveLink, '_blank');
  };

  const handleCheckAttendance = () => {
    setIsAttendanceModalOpen(true);
  };

  const handleViewAllRecordings = () => {
    // Open recordings page with listed recordings
    window.open('/recordings', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Join Class Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-6 w-6 text-primary animate-pulse" />
            Live Class Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {loading ? "Checking for live class..." : (isClassActive ? (isCurrentlyActive ? "Class is now in session" : "Class is scheduled for today") : "No active class right now")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isClassActive ? `Next class: Today at ${classTime}` : "No class scheduled for today"}
              </p>
            </div>
            <Button 
              disabled={!isClassActive || !joinLink || !isCurrentlyActive}
              className={isCurrentlyActive ? "bg-green-600 hover:bg-green-700 animate-pulse" : ""}
              size="lg"
              onClick={() => joinLink && window.open(joinLink, '_blank')}
            >
              <Video className="h-4 w-4 mr-2" />
              {isClassActive ? (isCurrentlyActive ? "Join Live Class" : "Class Not Started") : "No Active Class"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Only show Class Recordings section */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Class Recordings
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewAllRecordings}
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-4 w-4" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recordedSessions.map((session) => (
              <div 
                key={session.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-all cursor-pointer group"
                onClick={() => handleVideoClick(session.driveLink)}
              >
                <div className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={session.thumbnail} 
                    alt={session.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <ExternalLink className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {session.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{session.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AttendanceViewerModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
      />
    </div>
  );
}

export default LiveClasses;