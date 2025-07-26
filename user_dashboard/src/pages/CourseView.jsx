import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, SortAsc, BookOpen, FileCheck, Clock, Users, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useCourseTimer } from "@/components/courses/CourseTimerProvider";
import { fetchCourseModules } from "@/services/courseService";

export function CourseView() {
  const { courseId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [error, setError] = useState("");
  
  // Use timer context with default values
  const timer = useCourseTimer();
  const timeSpent = timer?.timeSpent || 0;
  const formatTime = timer?.formatTime || ((secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  });

  // Fetch modules for the course
  useEffect(() => {
    const fetchModules = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchCourseModules(courseId);
        setModules(data);
        setFilteredModules(data);
      } catch (err) {
        console.error('Error fetching modules:', err);
        setError("Failed to load course modules");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchModules();
    }
  }, [courseId]);

  // Filter modules based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredModules(modules);
    } else {
      const filtered = modules.filter(module =>
        module.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredModules(filtered);
    }
  }, [searchQuery, modules]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container py-6 max-w-7xl">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading course modules...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container py-6 max-w-7xl">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <FileCheck size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium mb-2">Failed to load modules</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container py-6 max-w-7xl">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/courses">
                <ChevronLeft size={16} />
                Back to courses
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <h1 className="text-3xl font-bold">Course Modules</h1>
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground" size={20} />
                <span className="font-medium">Time Spent:</span>
                <span className="font-mono text-lg">{formatTime(timeSpent)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search modules..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {filteredModules.length === 0 ? (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No modules found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery ? "Try adjusting your search query" : "This course doesn't have any modules yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map((module) => (
                <div key={module.id} className="module-card opacity-0 transition-all duration-500 ease-in-out">
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={module.image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"} 
                        alt={module.title}
                        className="w-full h-full object-cover"
                      />
                      {module.status === "locked" && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                              🔒
                            </div>
                            <p className="text-sm">Module Locked</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2">{module.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">{module.description}</p>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen size={14} />
                          <span>{module.lessonCount || 0} Lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileCheck size={14} />
                          <span>{module.assessmentCount || 0} Assessments</span>
                        </div>
                      </div>
                      
                      {module.duration && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock size={14} />
                          <span>{module.duration}</span>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant={module.status === "locked" ? "outline" : "default"}
                        disabled={module.status === "locked"}
                        asChild
                      >
                        <Link to={`/courses/${courseId}/module/${module.id}`}>
                          {module.status === "locked" ? "Module Locked" : "Start Module"}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CourseView;