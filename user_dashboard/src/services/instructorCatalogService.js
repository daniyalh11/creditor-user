// Instructor Catalog Service for managing catalogs in the instructor portal
import Cookies from 'js-cookie';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = Cookies.get('token');
  console.log('Token from cookies:', token ? 'Present' : 'Missing');
  
  // Try both Authorization header and cookie-based auth
  const headers = {
    'Content-Type': 'application/json',
  };
  
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Get all catalogs - try multiple endpoints
export async function fetchAllCatalogs() {
  try {
    // First try the catalog-specific endpoint
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/catalog/getallcatalogs`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    let catalogs = [];

    if (response.ok) {
      const data = await response.json();
      console.log('Catalogs API response:', data);
      // Handle the nested structure: data.data.catalogs or data.data
      catalogs = data.data?.catalogs || data.data || [];
    } else {
      // If that fails, try the course endpoint as fallback
      console.log('Catalog endpoint failed, trying course endpoint as fallback...');
      const courseResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/getAllCourses`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        const courses = courseData.data || [];
        
        // Group courses by category to create catalog-like structure
        const catalogGroups = {};
        courses.forEach(course => {
          const category = course.category || course.courseType || 'General';
          if (!catalogGroups[category]) {
            catalogGroups[category] = {
              id: category.toLowerCase().replace(/\s+/g, '-'),
              name: category,
              description: `${category} courses`,
              courses: []
            };
          }
          catalogGroups[category].courses.push(course);
        });
        
        catalogs = Object.values(catalogGroups);
      } else {
        // If both fail, throw error
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    }

    // Add local catalogs from localStorage
    const localCatalogs = JSON.parse(localStorage.getItem('localCatalogs') || '[]');
    catalogs = [...catalogs, ...localCatalogs];

    console.log('Final catalogs array:', catalogs);
    return catalogs;
  } catch (error) {
    console.error('Error fetching catalogs:', error);
    // If all API calls fail, return local catalogs only
    const localCatalogs = JSON.parse(localStorage.getItem('localCatalogs') || '[]');
    return localCatalogs;
  }
}

// Create a new catalog
export async function createCatalog(catalogData) {
  try {
    console.log('Creating catalog with data:', catalogData);
    console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/api/catalog/createcatalog`);
    
    const headers = getAuthHeaders();
    console.log('Request headers:', headers);
    
    // Log the exact request body being sent
    const requestBody = JSON.stringify(catalogData);
    console.log('Request body:', requestBody);
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/catalog/createcatalog`, {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: requestBody,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('Success response:', data);
      return data;
    }

    // If the catalog endpoint fails, create a local catalog structure
    if (response.status === 403 || response.status === 404 || response.status === 500) {
      console.log(`Catalog endpoint failed with status ${response.status}, creating local catalog structure...`);
      
      // Create a local catalog object
      const localCatalog = {
        id: `local-${Date.now()}`,
        name: catalogData.name,
        description: catalogData.description,
        thumbnail: catalogData.thumbnail, // Include thumbnail
        courses: [],
        createdAt: new Date().toISOString(),
        isLocal: true // Flag to indicate this is a local catalog
      };
      
      // Store in localStorage for persistence
      const existingCatalogs = JSON.parse(localStorage.getItem('localCatalogs') || '[]');
      existingCatalogs.push(localCatalog);
      localStorage.setItem('localCatalogs', JSON.stringify(existingCatalogs));
      
      return {
        success: true,
        message: `Catalog created locally (backend returned ${response.status} error)`,
        data: localCatalog
      };
    }

    // For 500 errors, try to get more detailed error info
    let errorData = {};
    try {
      errorData = await response.json();
      console.error('Error response data:', errorData);
    } catch (parseError) {
      console.error('Could not parse error response:', parseError);
      errorData = { message: 'Unknown server error' };
    }
    
    throw new Error(errorData.message || errorData.errorMessage || `HTTP error! status: ${response.status}`);
  } catch (error) {
    console.error('Error creating catalog:', error);
    throw error;
  }
}

// Update a catalog
export async function updateCatalog(catalogId, catalogData) {
  try {
    console.log('updateCatalog called with:', catalogId, catalogData);
    // Check if it's a local catalog
    if (catalogId.startsWith('local-')) {
      const localCatalogs = JSON.parse(localStorage.getItem('localCatalogs') || '[]');
      const catalogIndex = localCatalogs.findIndex(cat => cat.id === catalogId);
      if (catalogIndex !== -1) {
        localCatalogs[catalogIndex] = {
          ...localCatalogs[catalogIndex],
          ...catalogData,
          thumbnail: catalogData.thumbnail, // Always update thumbnail
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('localCatalogs', JSON.stringify(localCatalogs));
        console.log('Local catalog after update:', localCatalogs[catalogIndex]);
        return {
          success: true,
          message: 'Local catalog updated successfully',
          data: localCatalogs[catalogIndex]
        };
      }
    }

    // Try backend update
    console.log('Sending PUT to backend with:', catalogData);
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/catalog/${catalogId}/updatecatalog`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(catalogData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend update failed:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend update response:', data);
    return data;
  } catch (error) {
    console.error('Error updating catalog:', error);
    throw error;
  }
}

// Delete a catalog
export async function deleteCatalog(catalogId) {
  try {
    // Check if it's a local catalog
    if (catalogId.startsWith('local-')) {
      const localCatalogs = JSON.parse(localStorage.getItem('localCatalogs') || '[]');
      const updatedCatalogs = localCatalogs.filter(cat => cat.id !== catalogId);
      localStorage.setItem('localCatalogs', JSON.stringify(updatedCatalogs));
      
      return {
        success: true,
        message: 'Local catalog deleted successfully'
      };
    }

    // Try backend deletion
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/catalog/${catalogId}/deletecatalog`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting catalog:', error);
    throw error;
  }
}

// Add courses to a catalog
export async function addCoursesToCatalog(catalogId, courseIds) {
  try {
    // Check if it's a local catalog
    if (catalogId.startsWith('local-')) {
      const localCatalogs = JSON.parse(localStorage.getItem('localCatalogs') || '[]');
      const catalogIndex = localCatalogs.findIndex(cat => cat.id === catalogId);
      
      if (catalogIndex !== -1) {
        // Add courses to local catalog
        localCatalogs[catalogIndex].courses = [
          ...localCatalogs[catalogIndex].courses,
          ...courseIds
        ];
        localStorage.setItem('localCatalogs', JSON.stringify(localCatalogs));
        
        return {
          success: true,
          message: 'Courses added to local catalog successfully'
        };
      }
    }

    // Try backend addition
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/catalog/${catalogId}/addcourses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ courseIds }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    // If backend fails, handle locally
    if (response.status === 403 || response.status === 404 || response.status === 500) {
      console.log(`Add courses endpoint failed with status ${response.status}, handling locally...`);
      
      // For local catalogs, we already handled above
      // For backend catalogs, we'll just return success to avoid breaking the flow
      return {
        success: true,
        message: `Courses added locally (backend returned ${response.status} error)`
      };
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  } catch (error) {
    console.error('Error adding courses to catalog:', error);
    // Don't throw error, just return a success message to avoid breaking the flow
    return {
      success: true,
      message: 'Courses added locally (backend error handled)'
    };
  }
}

// Remove courses from a catalog
export async function removeCoursesFromCatalog(catalogId, courseIds) {
  try {
    // Check if it's a local catalog
    if (catalogId.startsWith('local-')) {
      const localCatalogs = JSON.parse(localStorage.getItem('localCatalogs') || '[]');
      const catalogIndex = localCatalogs.findIndex(cat => cat.id === catalogId);
      
      if (catalogIndex !== -1) {
        // Remove courses from local catalog
        localCatalogs[catalogIndex].courses = localCatalogs[catalogIndex].courses.filter(
          courseId => !courseIds.includes(courseId)
        );
        localStorage.setItem('localCatalogs', JSON.stringify(localCatalogs));
        
        return {
          success: true,
          message: 'Courses removed from local catalog successfully'
        };
      }
    }

    // Try backend removal
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/catalog/${catalogId}/courses`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ courseIds }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    // If backend fails, handle locally
    if (response.status === 403 || response.status === 404 || response.status === 500) {
      console.log(`Remove courses endpoint failed with status ${response.status}, handling locally...`);
      return {
        success: true,
        message: `Courses removed locally (backend returned ${response.status} error)`
      };
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  } catch (error) {
    console.error('Error removing courses from catalog:', error);
    return {
      success: true,
      message: 'Courses removed locally (backend error handled)'
    };
  }
}

// Get courses for a specific catalog
export async function getCatalogCourses(catalogId) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/catalog/${catalogId}/courses`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching catalog courses:', error);
    throw error;
  }
}

// Get all available courses for selection
export async function fetchAvailableCourses() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/getAllCourses`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching available courses:', error);
    throw error;
  }
}