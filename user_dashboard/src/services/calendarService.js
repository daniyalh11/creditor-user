export async function getAllEvents(params = {}) {
  const query = new URLSearchParams(params).toString();
  const headers = {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQ5MTFjYWQwLTkwY2MtNGJlZS05YzJiLTE5MDU3ZTA5YzhhYyIsImVtYWlsIjoibWF1c2FtQGNyZWRpdG9yYWNhZGVteS5jb20iLCJpYXQiOjE3NTMxODYwNzIsImV4cCI6MTc1NTc3ODA3Mn0.T-FZyXTCSUltgGyET0A1GNBseBQgAjXCZNesIIBOgH8'
  };
  const response = await fetch(`/calendar/events${query ? `?${query}` : ''}`, {
    credentials: 'include',
    headers,
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
  const response = await fetch('http://localhost:9000/calendar/events', {
    credentials: 'include',
    headers,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch upcoming events');
  }
  const data = await response.json();
  return data.data || [];
} 
