import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Play, Video, Clock, Calendar, Users } from "lucide-react";
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

// Helper: convert UTC string to user timezone Date
const convertUTCToUserTimezone = (dateString, userTimezone) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return new Date(date.toLocaleString("en-US", { timeZone: userTimezone }));
};

// Helper: is today in user's timezone
const isTodayInUserTimezone = (dateString, userTimezone) => {
  const eventDate = convertUTCToUserTimezone(dateString, userTimezone);
  const now = convertUTCToUserTimezone(new Date().toISOString(), userTimezone);
  return (
    eventDate.getFullYear() === now.getFullYear() &&
    eventDate.getMonth() === now.getMonth() &&
    eventDate.getDate() === now.getDate()
  );
};

// Helper: format time in user's timezone
const formatTimeInUserTimezone = (utcTime, userTimezone) => {
  if (!utcTime) return '';
  const date = new Date(utcTime);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: userTimezone
  });
};

export function LiveClasses() {
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayEvents, setTodayEvents] = useState([]);

  const userTimezone = localStorage.getItem('userTimezone') || 'America/Los_Angeles';

  useEffect(() => {
    const fetchLiveClass = async () => {
      setLoading(true);
      try {
        // Get today's date in user's timezone
        const now = new Date();
        const userTzToday = convertUTCToUserTimezone(now.toISOString(), userTimezone);
        
        // Create start and end of day in user's timezone, then convert to UTC for API
        const startOfDay = new Date(userTzToday);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(userTzToday);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Convert to UTC for API call
        const start = startOfDay.toISOString();
        const end = endOfDay.toISOString();
        
        console.log('Fetching events for date range:', { start, end, userTimezone });
        
        const params = new URLSearchParams({ startDate: start, endDate: end });

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/calendar/events?${params}`, {
          credentials: 'include',
        });
        const data = await response.json();

        console.log('API Response:', data);

        if (data?.data?.length > 0) {
          const nowUserTz = convertUTCToUserTimezone(new Date().toISOString(), userTimezone);
          // Only show if today in user's timezone AND not ended
          const todayEvents = data.data.filter(event => {
            if (!event.startTime || !event.endTime) return false;
            const isToday = isTodayInUserTimezone(event.startTime, userTimezone);
            const eventEnd = convertUTCToUserTimezone(event.endTime, userTimezone);
            return isToday && eventEnd > nowUserTz;
          });
          
          console.log('Filtered today events:', todayEvents);
          
          // Sort events by start time
          todayEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
          setTodayEvents(todayEvents);
        } else {
          console.log('No events found in API response');
          setTodayEvents([]);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setTodayEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveClass();
  }, [userTimezone]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTodayEvents(prevEvents => {
        const now = convertUTCToUserTimezone(new Date().toISOString(), userTimezone);
        return prevEvents.filter(event => {
          const endTime = convertUTCToUserTimezone(event.endTime, userTimezone);
          return now <= endTime; // Remove ended events
        }).map(event => {
          const startTime = convertUTCToUserTimezone(event.startTime, userTimezone);
          const endTime = convertUTCToUserTimezone(event.endTime, userTimezone);
          const isLive = now >= startTime && now <= endTime;
          return { ...event, isLive };
        });
      });
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, [userTimezone]);

  const getEventStatus = (event) => {
    const now = convertUTCToUserTimezone(new Date().toISOString(), userTimezone);
    const start = convertUTCToUserTimezone(event.startTime, userTimezone);
    const end = convertUTCToUserTimezone(event.endTime, userTimezone);
    if (now >= start && now <= end) {
      return { status: 'live', text: 'LIVE NOW', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    } else if (now < start) {
      return { status: 'upcoming', text: 'UPCOMING', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
    } else {
      return { status: 'ended', text: 'ENDED', color: 'text-gray-500', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
    }
  };

  const handleJoinClass = (event) => {
    const joinLink = event.description || event.zoomLink || "";
    if (joinLink) {
      window.open(joinLink, '_blank');
    }
  };

  const handleViewAllRecordings = () => {
    window.open(import.meta.env.VITE_RECORDINGS_DRIVE_URL, '_blank');
  };

  const liveEventsCount = todayEvents.filter(event => {
    const now = convertUTCToUserTimezone(new Date().toISOString(), userTimezone);
    const start = convertUTCToUserTimezone(event.startTime, userTimezone);
    const end = convertUTCToUserTimezone(event.endTime, userTimezone);
    return now >= start && now <= end;
  }).length;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className={`h-6 w-6 ${liveEventsCount > 0 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
            Today's Live Classes
            {liveEventsCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                {liveEventsCount} Live
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading today's classes...</p>
            </div>
          ) : todayEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600">No classes scheduled for today</p>
              <p className="text-sm text-muted-foreground mt-1">Check back later for upcoming classes</p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Current timezone: {userTimezone}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Events are filtered based on your timezone preference
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {todayEvents.map((event, index) => {
                const eventStatus = getEventStatus(event);
                const isLive = eventStatus.status === 'live';
                const isUpcoming = eventStatus.status === 'upcoming';
                return (
                  <div
                    key={event.id || index}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      isLive 
                        ? 'border-red-200 bg-red-50 shadow-sm' 
                        : 'border-blue-200 bg-blue-50 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${
                            isLive ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                          }`}></div>
                          <h4 className="font-semibold text-gray-800">{event.title}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            isLive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {eventStatus.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatTimeInUserTimezone(event.startTime, userTimezone)} - {formatTimeInUserTimezone(event.endTime, userTimezone)}
                            </span>
                          </div>
                          {event.instructor && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{event.instructor}</span>
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleJoinClass(event)}
                          disabled={!isLive}
                          className={`${
                            isLive 
                              ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          } text-white transition-all duration-300`}
                          size="sm"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          {isLive ? 'Join Now' : 'Class Not Started'}
                          {isLive && <ExternalLink className="w-3 h-3 ml-1" />}
                        </Button>
                        {isUpcoming && (
                          <div className="text-xs text-blue-600 text-center">
                            Starts in {Math.max(0, Math.floor((convertUTCToUserTimezone(event.startTime, userTimezone).getTime() - convertUTCToUserTimezone(new Date().toISOString(), userTimezone).getTime()) / (1000 * 60)))}m
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
