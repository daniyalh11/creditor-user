export async function fetchAllCourses() {
    const response = await fetch('http://localhost:9000/api/course/getAllCourses', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add Authorization header if required
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
  const response = await fetch('http://localhost:9000/api/course/getCourses', {
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