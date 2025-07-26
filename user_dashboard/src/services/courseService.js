export async function fetchAllCourses() {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/getAllCourses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Ensure cookies are sent
    });
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    const data = await response.json();
    return data.data;
  }

export async function fetchUserCourses() {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/getCourses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user courses');
  }
  const data = await response.json();
  return data.data;
}

export async function fetchCourseModules(courseId) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/getAllModules`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch course modules');
  }
  const data = await response.json();
  return data.data || data; // Handle different response structures
}