// Service to fetch calendar events from backend
export async function getAllEvents(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/calendar/events${query ? `?${query}` : ''}`, {
    credentials: 'include', // send cookies if needed for auth
  });
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  const data = await response.json();
  return data.data || [];
} 