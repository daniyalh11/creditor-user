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
          // Filter events to only show classes for the current date
          const todayEvents = data.data.filter(event => {
            if (!event.startTime) return false;
            const eventDate = new Date(event.startTime);
            const currentDate = new Date();
            
            // Compare dates (year, month, day) only, ignoring time
            return eventDate.getFullYear() === currentDate.getFullYear() &&
                   eventDate.getMonth() === currentDate.getMonth() &&
                   eventDate.getDate() === currentDate.getDate();
          });
          
          console.log('Today events:', todayEvents);
          const userTimezone = localStorage.getItem('userTimezone') || 'America/New_York';
          console.log('User timezone:', userTimezone);
          const now = new Date();
          const nowInUserTz = now;
          const nowInUserTimezone = nowInUserTz.toLocaleString('en-US', { 
            timeZone: userTimezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          console.log('Now in user tz:', nowInUserTimezone, '(', nowInUserTz, ')');
                      todayEvents.forEach(event => {
              const startInUserTz = new Date(event.startTime);
              const endInUserTz = new Date(event.endTime);
              console.log('Event:', event.title, 'Start:', startInUserTz, 'End:', endInUserTz);
            });

          if (todayEvents.length > 0) {
            // Find the closest upcoming event (start time is in the future)
            const upcomingEvents = todayEvents.filter(event => {
              const startInUserTz = new Date(event.startTime);
              const isUpcoming = startInUserTz > nowInUserTz;
              
              // Convert to user's timezone for display
              const startInUserTimezone = startInUserTz.toLocaleString('en-US', { 
                timeZone: userTimezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              });
              
              console.log(`Event "${event.title}": Start time in user tz: ${startInUserTimezone} (${startInUserTz}), Now in user tz: ${nowInUserTz}, Is upcoming: ${isUpcoming}`);
              return isUpcoming;
            });
            
            // Sort by start time and get the closest one
            upcomingEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            const nextEvent = upcomingEvents[0];
            
            console.log('Upcoming events:', upcomingEvents.map(e => e.title));
            console.log('Selected live class:', nextEvent?.title || 'None (no upcoming events)');
            setLiveClass(nextEvent || null);
          } else {
            setLiveClass(null);
          }
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

    // Removed debug POST request - it was causing 500 errors
  }, []);

  const isClassActive = !!liveClass;
  const joinLink = liveClass?.description || "";
  const classTitle = liveClass?.title || "";
  
  // Get user's timezone from localStorage, default to EST if not set
  const userTimezone = localStorage.getItem('userTimezone') || 'America/New_York';
  
  // Convert UTC time to user's timezone for display
  const formatTimeInUserTimezone = (utcTime) => {
    if (!utcTime) return '';
    const date = new Date(utcTime);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: userTimezone 
    });
  };
  
  const classTime = liveClass ? `${formatTimeInUserTimezone(liveClass.startTime)} - ${classTitle}` : "";

  // Check if class is currently in session (within start and end time) using user's timezone
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
    // Open recordings Google Drive link from env
    window.open(import.meta.env.VITE_RECORDINGS_DRIVE_URL, '_blank');
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