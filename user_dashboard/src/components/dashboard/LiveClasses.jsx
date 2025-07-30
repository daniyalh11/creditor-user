import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Play, Video } from "lucide-react";
import { AttendanceViewerModal } from "./AttendanceViewerModal";

// Mock data
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

const convertToTimezone = (dateString, timeZone) => {
  return new Date(new Date(dateString).toLocaleString("en-US", { timeZone }));
};

export function LiveClasses() {
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCurrentlyActive, setIsCurrentlyActive] = useState(false);

  const userTimezone = localStorage.getItem('userTimezone') || 'America/Los_Angeles'; // PST fallback
  // At the top, add:
const formatDateTime = (dateString, timeZone) => {
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone,
  };
  return new Intl.DateTimeFormat("en-US", options).format(new Date(dateString));
};

const convertToTimezone = (dateString, timeZone) => {
  return new Date(new Date(dateString).toLocaleString("en-US", { timeZone }));
};

  useEffect(() => {
    const fetchLiveClass = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const start = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const end = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        const params = new URLSearchParams({ startDate: start, endDate: end });

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/calendar/events?${params}`, {
          credentials: 'include',
        });
        const data = await response.json();

        if (data?.data?.length > 0) {
          // Fetch all today's events and find the currently active one
const todayEvents = data.data.filter(event => {
  if (!event.startTime || !event.endTime) return false;

  const eventDate = convertToTimezone(event.startTime, userTimezone);
  const now = convertToTimezone(new Date().toISOString(), userTimezone);

  return (
    eventDate.getFullYear() === now.getFullYear() &&
    eventDate.getMonth() === now.getMonth() &&
    eventDate.getDate() === now.getDate()
  );
});

// First, find the currently active class in user TZ
const now = convertToTimezone(new Date().toISOString(), userTimezone);
const activeEvent = todayEvents.find(event => {
  const start = convertToTimezone(event.startTime, userTimezone);
  const end = convertToTimezone(event.endTime, userTimezone);
  return now >= start && now <= end;
});

if (activeEvent) {
  setLiveClass(activeEvent);
} else {
  // If no class is live, set the next upcoming class
  const upcoming = todayEvents
    .filter(event => convertToTimezone(event.startTime, userTimezone) > now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  setLiveClass(upcoming[0] || null);
}

          const upcomingEvents = todayEvents.filter(event => {
            const startInTz = convertToTimezone(event.startTime, userTimezone);
            return startInTz > convertToTimezone(new Date().toISOString(), userTimezone);
          });

          upcomingEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
          setLiveClass(upcomingEvents[0] || null);
        } else {
          setLiveClass(null);
        }
      } catch (err) {
        console.error(err);
        setLiveClass(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveClass();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsCurrentlyActive(isClassInSession());
    }, 30 * 1000); // refresh every 30s

    setIsCurrentlyActive(isClassInSession()); // initial check

    return () => clearInterval(interval);
  }, [liveClass]);

  const isClassInSession = () => {
    if (!liveClass || !liveClass.startTime || !liveClass.endTime) return false;
    const now = convertToTimezone(new Date().toISOString(), userTimezone);
    const start = convertToTimezone(liveClass.startTime, userTimezone);
    const end = convertToTimezone(liveClass.endTime, userTimezone);
    return now >= start && now <= end;
  };
  
  const joinLink = liveClass?.description || "";
  const classTitle = liveClass?.title || "";

  const formatTimeInUserTimezone = (utcTime) => {
    if (!utcTime) return '';
    const date = new Date(utcTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: userTimezone
    });
  };

  const classTime = liveClass ? `${formatTimeInUserTimezone(liveClass.startTime)} - ${classTitle}` : "";

  const handleViewAllRecordings = () => {
    window.open(import.meta.env.VITE_RECORDINGS_DRIVE_URL, '_blank');
  };

  return (
    <div className="space-y-6">
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
                {loading
                  ? "Checking for live class..."
                  : liveClass
                    ? (isCurrentlyActive ? "Class is now in session" : "Class is scheduled for today")
                    : "No active class right now"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {liveClass ? `Next class: Today at ${classTime}` : "No class scheduled for today"}
              </p>
            </div>
            <Button
              disabled={!liveClass || !joinLink || !isCurrentlyActive}
              className={isCurrentlyActive ? "bg-green-600 hover:bg-green-700 animate-pulse" : ""}
              size="lg"
              onClick={() => window.open(joinLink, '_blank')}
            >
              <Video className="h-4 w-4 mr-2" />
              {liveClass
                ? isCurrentlyActive ? "Join Live Class" : "Class Not Started"
                : "No Active Class"}
            </Button>
          </div>
        </CardContent>
      </Card>

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
                onClick={() => window.open(session.driveLink, "_blank")}
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

      <AttendanceViewerModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
      />
    </div>
  );
}

export default LiveClasses;
