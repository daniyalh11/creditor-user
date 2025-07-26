// Service for user profile API calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api';

export async function fetchUserProfile() {
  const response = await fetch(`${API_BASE_URL}/user/getUserProfile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
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
  const response = await fetch(`${API_BASE_URL}/user/updateUserProfile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    credentials: 'include',
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    throw new Error('Failed to update user profile');
  }
  return await response.json();
} 