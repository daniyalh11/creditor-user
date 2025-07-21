// Service to fetch calendar events from backend
export async function getAllEvents() {
  const response = await fetch('/api/calendar/events', {
    credentials: 'include', // send cookies if needed for auth
  });
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  const data = await response.json();
  return data.data || [];
} 