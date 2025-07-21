// Service for user profile API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function fetchUserProfile() {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
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
  return await response.json();
}

export async function updateUserProfile(profileData) {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
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