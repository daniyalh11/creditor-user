import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Clock, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchCatalogCourses, searchCourses } from "@/services/catalogService";

export function CatalogPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await fetchCatalogCourses();
        setCourses(data || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Extract categories and levels from fetched courses
  const categories = Array.from(new Set(courses.map(course => course.category || course.courseType || "General")));
  const levels = Array.from(new Set(courses.map(course => course.course_level || course.level || "Beginner")));

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           (course.category || course.courseType || "General") === selectedCategory;
    const matchesLevel = selectedLevel === "all" || 
                        (course.course_level || course.level || "Beginner") === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container py-6 max-w-7xl">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading courses...</span>
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
                <p className="text-red-600 mb-4">{error}</p>
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Course Catalog</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[200px]"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No courses found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div key={course.id} className="group overflow-hidden rounded-lg border bg-card hover:shadow-md transition-all">
                  <div className="aspect-video w-full relative overflow-hidden">
                    <img
                      src={course.thumbnail || course.image || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000"}
                      alt={course.title}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                    <Badge 
                      className="absolute top-2 right-2"
                      variant="secondary"
                    >
                      {course.category || course.courseType || "General"}
                    </Badge>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{course.description}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.estimated_duration || course.duration || "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.modules?.length || course.lessons || 0} lessons
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {course.course_level || course.level || "Beginner"}
                      </Badge>
                      <span className="font-semibold text-lg">
                        ${course.price || 0}
                      </span>
                    </div>

                    <Button className="w-full mt-2" asChild>
                      <Link to={`/dashboard/catalog/category/${encodeURIComponent(course.category || course.courseType || "General")}`}>
                        Explore
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CatalogPage;