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

export async function createCourse(courseData) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/createCourse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(courseData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to create course (${response.status})`);
  }
  
  const data = await response.json();
  return data;
}

export async function updateCourse(courseId, courseData) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/editCourse/${courseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(courseData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to update course (${response.status})`);
  }
  
  const data = await response.json();
  return data;
}

export async function fetchCourseUsers(courseId) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/getAllUsersByCourseId`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch course users');
  }
  
  const data = await response.json();
  return data.data || [];
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

export async function createModule(courseId, moduleData) {
  console.log('Creating module for courseId:', courseId);
  console.log('Module data being sent:', moduleData);
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(moduleData),
  });
  
  console.log('Response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    console.error('Error response:', errorData);
    throw new Error(errorData.message || `Failed to create module (${response.status})`);
  }
  
  const data = await response.json();
  console.log('Success response:', data);
  return data.data || data;
}

export async function updateModule(courseId, moduleId, moduleData) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(moduleData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to update module (${response.status})`);
  }
  const data = await response.json();
  return data.data || data;
}

export async function deleteModule(courseId, moduleId, moduleData) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'text/plain',
    },
    credentials: 'include',
    body: JSON.stringify(moduleData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to delete module (${response.status})`);
  }
  const data = await response.json();
  return data.data || data;
}

export async function deleteCourse(courseId) {
  console.log('Deleting course:', courseId);
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  console.log('Delete course response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    console.error('Error response:', errorData);
    throw new Error(errorData.message || `Failed to delete course (${response.status})`);
  }
  
  const data = await response.json();
  console.log('Success response:', data);
  return data.data || data;
}

export async function unenrollUser(courseId, userId) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/courses/${courseId}/unenrollUser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ userId }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to unenroll user (${response.status})`);
  }
  
  const data = await response.json();
  return data;
}