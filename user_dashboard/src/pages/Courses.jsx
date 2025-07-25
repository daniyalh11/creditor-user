import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { BookOpen, Clock, Filter, Search, Award } from "lucide-react";
import { Input } from "../components/ui/input";
import { fetchUserCourses } from '../services/courseService';

export function Courses() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [progressFilter, setProgressFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Helper to format seconds as HH:MM:SS
  function formatTime(secs) {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }
  // Get time spent for all courses from localStorage
  const getCourseTimes = () => {
    const times = {};
    courses.forEach(course => {
      const t = localStorage.getItem(`course_time_${course.id}`);
      times[course.id] = t ? parseInt(t, 10) : 0;
    });
    return times;
  };
  const [courseTimes, setCourseTimes] = useState(getCourseTimes());
  // Update times when component mounts and when tab regains focus
  useEffect(() => {
    const updateTimes = () => setCourseTimes(getCourseTimes());
    window.addEventListener("focus", updateTimes);
    return () => window.removeEventListener("focus", updateTimes);
  }, []);
  // Update times when route changes to /courses
  useEffect(() => {
    if (location.pathname === "/courses") {
      setCourseTimes(getCourseTimes());
    }
  }, [location.pathname]);

  useEffect(() => {
    const courseCards = document.querySelectorAll(".course-card");
    courseCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("animate-fade-in");
        card.classList.remove("opacity-0");
      }, 100 * index);
    });
  }, [filteredCourses]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await fetchUserCourses();
        setCourses(data);
        setFilteredCourses(data);
      } catch (err) {
        setError("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    let results = courses;

    // Apply search filter
    if (searchTerm) {
      results = results.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply progress filter
    if (progressFilter !== "all") {
      if (progressFilter === "completed") {
        results = results.filter(course => course.progress === 100);
      } else if (progressFilter === "in-progress") {
        results = results.filter(course => course.progress > 0 && course.progress < 100);
      } else if (progressFilter === "not-started") {
        results = results.filter(course => course.progress === 0);
      }
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      results = results.filter(course => course.category === categoryFilter);
    }

    setFilteredCourses(results);
  }, [searchTerm, progressFilter, categoryFilter]);

  const categories = [...new Set(courses.map(course => course.category))];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container py-6 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">My Courses</h1>
            
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} className="mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Progress</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={progressFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProgressFilter("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={progressFilter === "completed" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProgressFilter("completed")}
                    >
                      Completed
                    </Button>
                    <Button
                      variant={progressFilter === "in-progress" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProgressFilter("in-progress")}
                    >
                      In Progress
                    </Button>
                    <Button
                      variant={progressFilter === "not-started" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProgressFilter("not-started")}
                    >
                      Not Started
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={categoryFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoryFilter("all")}
                    >
                      All
                    </Button>
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={categoryFilter === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <p>Loading courses...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12 text-red-500">
                {error}
              </div>
            ) : filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div key={course.id} className="course-card opacity-0 transition-all duration-500 ease-in-out">
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                      />
                      <Badge className="absolute top-2 right-2 bg-black/70" variant="secondary">
                        {course.category}
                      </Badge>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>{course.instructor}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <BookOpen size={14} />
                          <span>Course</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                      {/* Time spent display */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Clock size={12} />
                        <span>Time spent:</span>
                        <span className="font-mono">{formatTime(courseTimes[course.id] || 0)}</span>
                      </div>
                      
                      {course.progress > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="pt-2 flex flex-col gap-2">
                      <Link to={`/dashboard/courses/${course.id}`} className="w-full">
                        <Button variant="default" className="w-full">
                          {course.progress > 0 ? "Continue Learning" : "Start Course"}
                        </Button>
                      </Link>
                      
                      {course.progress === 100 && (
                        <Link to={`/certificate/${course.id}`} className="w-full">
                          <Button variant="outline" className="w-full">
                            <Award size={16} className="mr-2" />
                            View Certificate
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium">No courses found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Courses;