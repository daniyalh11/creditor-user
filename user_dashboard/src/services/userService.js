// Service for user profile API calls

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
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/updateUserProfile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to update user profile');
    }
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
} 