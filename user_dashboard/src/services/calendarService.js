// Centralized calendar API URL logic

const LOCAL_API = import.meta.env.VITE_BACKEND_API_LOCAL || 'http://localhost:9000';
const RENDER_API = import.meta.env.VITE_BACKEND_API_RENDER || 'https://sharebackend-9g3y.onrender.com';

// Choose which to use (default to render if deployed, local if dev)
export const getCalendarApiBase = () => {
  return RENDER_API;
};

// Example usage: fetch(`${getCalendarApiBase()}/calendar/events`)

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

export async function getAllUpcomingEvents() {
  const headers = {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQ5MTFjYWQwLTkwY2MtNGJlZS05YzJiLTE5MDU3ZTA5YzhhYyIsImVtYWlsIjoibWF1c2FtQGNyZWRpdG9yYWNhZGVteS5jb20iLCJpYXQiOjE3NTMxODYwNzIsImV4cCI6MTc1NTc3ODA3Mn0.T-FZyXTCSUltgGyET0A1GNBseBQgAjXCZNesIIBOgH8'
  };
  const response = await fetch(`${getCalendarApiBase()}/calendar/events`, {
    credentials: 'include',
    headers,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch upcoming events');
  }
  const data = await response.json();
  return data.data || [];
} 
