// Service for user profile API calls

// Utility function to get user role
export function getUserRole() {
  return localStorage.getItem('userRole') || 'user';
}

// Utility function to set user role
export function setUserRole(role) {
  localStorage.setItem('userRole', role);
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('userRoleChanged'));
}

// Utility function to check if user is instructor or admin
export function isInstructorOrAdmin() {
  const role = getUserRole();
  return role === 'instructor' || role === 'admin';
}

// Utility function to clear user data on logout
export function clearUserData() {
  localStorage.removeItem('userRole');
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('userRoleChanged'));
}

export async function fetchUserProfile() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/getUserProfile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("UserService response:", result);
    
    if (result.success && result.data) {
      return result.data; // Return only the user object
    } else {
      throw new Error(result.message || 'Failed to fetch user profile');
    }
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    throw error;
  }
}

export async function updateUserProfile(profileData) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/updateUserProfile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    throw new Error('Failed to update user profile');
  }
  return await response.json();
}