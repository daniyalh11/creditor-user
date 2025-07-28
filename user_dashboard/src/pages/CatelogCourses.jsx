import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, ArrowLeft, Loader2 } from "lucide-react";
import { getCatalogCourses } from "@/services/instructorCatalogService";

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
        
        // Fetch the courses in this catalog using the instructor service
        let coursesData = await getCatalogCourses(catalogId);
        console.log('Courses data from API:', coursesData);
        
        // If API returns empty and we have catalog data from state, try to use that
        if ((!coursesData || coursesData.length === 0) && catalogFromState?.courses) {
          console.log('Using courses from catalog state:', catalogFromState.courses);
          coursesData = catalogFromState.courses;
        }
        
        // Handle nested course structure - extract course objects if they're nested
        let processedCourses = [];
        if (Array.isArray(coursesData)) {
          processedCourses = coursesData.map(item => {
            // If the item has a nested 'course' property, extract it
            if (item && typeof item === 'object' && item.course) {
              return item.course;
            }
            // If the item is already a course object, use it as is
            return item;
          });
        }
        
        console.log('Processed courses data:', processedCourses);
        console.log('First course structure:', processedCourses?.[0]);
        
        // Log all available fields in the first course
        if (processedCourses?.[0]) {
          console.log('Available fields in first course:', Object.keys(processedCourses[0]));
          console.log('Course title field value:', processedCourses[0].title);
          console.log('Course description field value:', processedCourses[0].description);
          console.log('Course instructor field value:', processedCourses[0].instructor);
        }
        
        setCourses(processedCourses);
        
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
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Catalog Thumbnail */}
                  {catalog?.thumbnail && (
                    <div className="flex-shrink-0">
                      <img
                        src={catalog.thumbnail}
                        alt={catalog.name}
                        className="w-32 h-32 object-cover rounded-lg shadow-sm border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Catalog Info */}
                  <div className="flex-1">
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
              {filteredCourses.map((course, idx) => (
                <div 
                  key={course.id || course._id || course.uuid || idx} 
                  className="group flex flex-col border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden h-full"
                >
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.thumbnail || course.image || course.coverImage || course.course_image || course.thumbnail_url || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000"}
                      alt={course.title || course.name || course.courseName || course.course_title || 'Course image'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000";
                      }}
                    />
                    
                    {/* Course Level and Price Badges */}
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <Badge key={`${course.id}-level`} variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm">
                        {course.course_level || course.level || course.difficulty || "Beginner"}
                      </Badge>
                      <Badge key={`${course.id}-price`} variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm">
                        ${course.price || course.cost || 0}
                      </Badge>
                    </div>
                    
                    {/* Category Badge */}
                    {course.category && (
                      <div className="absolute top-3 right-3">
                        <Badge key={`${course.id}-category`} variant="outline" className="bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm">
                          {course.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Course Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex-1">
                      {/* Course Title */}
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {course.title || course.name || course.courseName || course.course_title || course.courseName || <span className="text-red-500">Missing title</span>}
                      </h2>
                      
                      {/* Course Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {course.description || course.summary || course.shortDescription || course.course_description || course.desc || course.content || course.overview || course.synopsis || course.details || course.about || <span className="text-red-500">No description available</span>}
                      </p>
                      
                      {/* Course Tags/Skills */}
                      {course.tags && course.tags.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {course.tags.slice(0, 3).map((tag, index) => (
                              <span 
                                key={`${course.id}-tag-${index}`} 
                                className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {course.tags.length > 3 && (
                              <span key={`${course.id}-more-tags`} className="inline-block px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-full">
                                +{course.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Course Details */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                                             {/* Duration and Lessons */}
                       <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                         <span key={`${course.id}-duration`} className="flex items-center gap-1.5">
                           <Clock size={14} className="text-gray-400 shrink-0" />
                           {course.estimated_duration || course.duration || course.timeEstimate || course.timeRequired || course.duration_hours || course.hours || course.time || course.length || course.course_duration || "N/A"}
                         </span>
                         <span key={`${course.id}-lessons`} className="flex items-center gap-1.5">
                           <BookOpen size={14} className="text-gray-400 shrink-0" />
                           {course.modules?.length || course.lessons?.length || course.lessonCount || course.totalLessons || course.lesson_count || course.total_lessons || course.numberOfLessons || course.lessons_count || (course.lessons && Array.isArray(course.lessons) ? course.lessons.length : 0) || 0} lessons
                         </span>
                        {course.rating && (
                          <span key={`${course.id}-rating`} className="flex items-center gap-1.5">
                            <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292z" />
                            </svg>
                            {course.rating}
                          </span>
                        )}
                      </div>
                      
                                             {/* Instructor */}
                       <div className="text-sm text-gray-700 mb-2">
                         <span className="font-medium">Instructor:</span> {course.instructor || course.createdBy || course.author || course.teacher || course.instructorName || course.instructor_name || course.created_by || course.creator || course.owner || course.user || course.userName || course.username || "N/A"}
                       </div>
                      
                      {/* Language */}
                      {course.language && (
                        <div className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Language:</span> {course.language}
                        </div>
                      )}
                      
                      {/* Last Updated */}
                      {course.updatedAt && (
                        <div className="text-xs text-gray-500">
                          Updated: {new Date(course.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                      
                      {/* Enrollment Status */}
                      {course.enrollmentStatus && (
                        <div className="mt-2">
                          <Badge 
                            key={`${course.id}-enrollment`}
                            variant={course.enrollmentStatus === 'enrolled' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {course.enrollmentStatus === 'enrolled' ? 'Enrolled' : 'Available'}
                          </Badge>
                        </div>
                      )}
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