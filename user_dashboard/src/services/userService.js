// Service for user profile API calls

export async function fetchUserProfile() {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/getUserProfile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  const result = await response.json();
  return result.data; // Return only the user object
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