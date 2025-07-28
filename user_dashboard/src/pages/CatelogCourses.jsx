import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, ArrowLeft, Loader2 } from "lucide-react";
import { fetchCatalogById, fetchCatalogCourses } from "@/services/catalogService";

const CatelogCourses = () => {
  const { catalogId } = useParams();
  const location = useLocation();
  const [catalog, setCatalog] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  // Fetch catalog courses from backend
  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        
        console.log('Fetching courses for catalog ID:', catalogId);
        
        // Use catalog data from URL state if available, otherwise create basic object
        const catalogFromState = location.state?.catalog;
        if (catalogFromState) {
          setCatalog(catalogFromState);
        } else {
          setCatalog({
            id: catalogId,
            name: `Catalog ${catalogId.split('-')[0]}`, // Show first part of UUID for readability
            description: "Course catalog"
          });
        }
        
        // Fetch the courses in this catalog
        const coursesData = await fetchCatalogCourses(catalogId);
        console.log('Courses data:', coursesData);
        setCourses(coursesData || []);
        
      } catch (err) {
        console.error("Failed to fetch catalog courses:", err);
        // Don't show error, just set empty courses array
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (catalogId) {
      fetchCatalogData();
    }
  }, [catalogId, location.state]);

  // Use the fetched courses directly since they're already filtered by catalog
  const filteredCourses = courses || [];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-1">
          <div className="container py-8 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading catalog...</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-1">
          <div className="container py-8 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="container py-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header Section */}
          <div className="mb-8">
            <div className="flex flex-col">
              <div className="flex flex-col">
                <Link 
                  to="/dashboard/catalog" 
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mb-4"
                >
                  <ArrowLeft size={16} className="shrink-0" />
                  Back to Catalogs
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                      {catalog?.name || "Catalog"}
                    </h1>
                    <p className="mt-2 text-gray-600">
                      {catalog?.description || "Course catalog"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {filteredCourses.length === 0 
                        ? "No courses available in this catalog" 
                        : `${filteredCourses.length} ${filteredCourses.length === 1 ? 'course' : 'courses'} available`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge key="category" variant="secondary" className="px-3 py-1 text-sm">
                      {catalog?.category || "General"}
                    </Badge>
                    <Badge key="count" variant="outline" className="px-3 py-1 text-sm">
                      {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="mx-auto max-w-md">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No courses available</h3>
                <p className="mt-2 text-gray-600">
                  {loading ? "Loading courses..." : "This catalog doesn't have any courses yet. Check back later for new content!"}
                </p>
                <div className="mt-6">
                  <Link
                    to="/dashboard/catalog"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Browse all catalogs
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map(course => (
                <div 
                  key={course.id} 
                  className="group flex flex-col border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden h-full"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.thumbnail || course.image || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000"}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <Badge key="level" variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm">
                        {course.course_level || course.level || "Beginner"}
                      </Badge>
                      <Badge key="price" variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm">
                        ${course.price || 0}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h2>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-gray-400 shrink-0" />
                          {course.estimated_duration || course.duration || "N/A"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={14} className="text-gray-400 shrink-0" />
                          {course.modules?.length || course.lessons || 0} lessons
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-gray-700">
                        <span className="font-medium">Instructor:</span> {course.instructor || course.createdBy || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CatelogCourses;