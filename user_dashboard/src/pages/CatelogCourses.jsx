import React from "react";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, ArrowLeft } from "lucide-react";

const courses = [
  {
    id: "1",
    title: "Complete React Developer in 2023",
    description: "Learn React with Redux, Hooks, GraphQL from industry experts. Build real projects.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000",
    category: "Web Development",
    level: "Intermediate",
    duration: "25 hours",
    lessons: 42,
    instructor: "John Smith",
    price: 89.99
  },
  {
    id: "2",
    title: "Advanced JavaScript Concepts",
    description: "Master advanced JavaScript concepts: prototypal inheritance, closures, and more.",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1000",
    category: "Programming",
    level: "Advanced",
    duration: "18 hours",
    lessons: 28,
    instructor: "Sarah Johnson",
    price: 79.99
  },
  {
    id: "3",
    title: "UI/UX Design Masterclass",
    description: "Create stunning user interfaces and improve user experiences for web applications.",
    image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=1000",
    category: "Design",
    level: "Beginner",
    duration: "22 hours",
    lessons: 36,
    instructor: "Michael Chen",
    price: 99.99
  },
  {
    id: "4",
    title: "Node.js Complete Guide",
    description: "Build complete backend solutions with Node.js, Express, and MongoDB.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000",
    category: "Backend",
    level: "Intermediate",
    duration: "28 hours",
    lessons: 38,
    instructor: "David Wilson",
    price: 94.99
  },
  {
    id: "5",
    title: "TypeScript Fundamentals",
    description: "Learn TypeScript from basics to advanced concepts with practical examples.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000",
    category: "Programming",
    level: "Beginner",
    duration: "20 hours",
    lessons: 32,
    instructor: "Emma Davis",
    price: 69.99
  }
];

const CatelogCourses = () => {
  const { categoryName } = useParams();
  const decodedCategory = decodeURIComponent(categoryName || "");
  const filteredCourses = courses.filter(c => c.category === decodedCategory);

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
                  Back to Catalog
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{decodedCategory}</h1>
                    <p className="mt-2 text-gray-600">
                      {filteredCourses.length === 0 
                        ? "No courses available in this category" 
                        : `${filteredCourses.length} ${filteredCourses.length === 1 ? 'course' : 'courses'} available`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1 text-sm">
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
                <h3 className="mt-4 text-lg font-medium text-gray-900">No courses found</h3>
                <p className="mt-2 text-gray-600">We couldn't find any courses matching this category.</p>
                <div className="mt-6">
                  <Link
                    to="/dashboard/catalog"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Browse all categories
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
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm">
                        {course.level}
                      </Badge>
                      <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm">
                        ${course.price.toFixed(2)}
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
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={14} className="text-gray-400 shrink-0" />
                          {course.lessons} lessons
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-gray-700">
                        <span className="font-medium">Instructor:</span> {course.instructor}
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