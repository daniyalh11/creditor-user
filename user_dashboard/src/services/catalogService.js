// Catalog Service for handling catalog-related API calls

export async function fetchCatalogCourses(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/getAllCourses${query ? `?${query}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching catalog courses:', error);
    throw error;
  }
}

export async function fetchCoursesByCategory(category) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/getAllCourses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const allCourses = data.data || [];
    
    // Filter courses by category
    return allCourses.filter(course => 
      (course.category || course.courseType || "General") === category
    );
  } catch (error) {
    console.error('Error fetching courses by category:', error);
    throw error;
  }
}

export async function fetchCourseCategories() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/getAllCourses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const courses = data.data || [];
    
    // Extract unique categories
    const categories = Array.from(new Set(
      courses.map(course => course.category || course.courseType || "General")
    ));
    
    return categories;
  } catch (error) {
    console.error('Error fetching course categories:', error);
    throw error;
  }
}

export async function searchCourses(searchTerm, filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    
    if (filters.level && filters.level !== 'all') {
      params.append('level', filters.level);
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/getAllCourses?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const allCourses = data.data || [];
    
    // Apply client-side filtering if backend doesn't support it
    let filteredCourses = allCourses;
    
    if (searchTerm) {
      filteredCourses = filteredCourses.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.category && filters.category !== 'all') {
      filteredCourses = filteredCourses.filter(course =>
        (course.category || course.courseType || "General") === filters.category
      );
    }
    
    if (filters.level && filters.level !== 'all') {
      filteredCourses = filteredCourses.filter(course =>
        (course.course_level || course.level || "Beginner") === filters.level
      );
    }
    
    return filteredCourses;
  } catch (error) {
    console.error('Error searching courses:', error);
    throw error;
  }
} 