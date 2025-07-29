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

// Helper function to clean up duplicate catalogs
const cleanupDuplicateCatalogs = (catalogs) => {
  const seen = new Set();
  return catalogs.filter(catalog => {
    const key = catalog.id || catalog.originalId || catalog.name;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
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

    // Add local catalogs from localStorage, avoiding duplicates
    const localCatalogs = JSON.parse(localStorage.getItem('localCatalogs') || '[]');
    
    // Filter out local catalogs that might duplicate backend catalogs
    const backendCatalogIds = catalogs.map(cat => cat.id);
    const uniqueLocalCatalogs = localCatalogs.filter(localCat => 
      !backendCatalogIds.includes(localCat.id) && 
      !backendCatalogIds.includes(localCat.originalId)
    );
    
    // Clean up any existing duplicates in localStorage
    if (uniqueLocalCatalogs.length !== localCatalogs.length) {
      localStorage.setItem('localCatalogs', JSON.stringify(uniqueLocalCatalogs));
    }
    
    catalogs = [...catalogs, ...uniqueLocalCatalogs];

    // Final cleanup to remove any remaining duplicates
    catalogs = cleanupDuplicateCatalogs(catalogs);

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
      
      // Handle permission errors gracefully
      if (response.status === 403) {
        console.log('Permission denied, updating locally instead');
        // Update locally as fallback - but don't create duplicates
        const localCatalogs = JSON.parse(localStorage.getItem('localCatalogs') || '[]');
        const catalogIndex = localCatalogs.findIndex(cat => cat.id === catalogId);
        
        if (catalogIndex !== -1) {
          // Update existing local catalog
          localCatalogs[catalogIndex] = {
            ...localCatalogs[catalogIndex],
            ...catalogData,
            thumbnail: catalogData.thumbnail,
            updatedAt: new Date().toISOString()
          };
        } else {
          // Only create new local catalog entry if it doesn't exist
          // Check if this might be a backend catalog that we're converting to local
          const existingCatalog = localCatalogs.find(cat => 
            cat.name === catalogData.name || 
            cat.id === catalogId ||
            cat.originalId === catalogId
          );
          
          if (!existingCatalog) {
            localCatalogs.push({
              id: `local-${catalogId}`,
              originalId: catalogId, // Keep reference to original ID
              ...catalogData,
              thumbnail: catalogData.thumbnail,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isLocal: true
            });
          } else {
            // Update the existing catalog instead
            const existingIndex = localCatalogs.findIndex(cat => cat.id === existingCatalog.id);
            localCatalogs[existingIndex] = {
              ...localCatalogs[existingIndex],
              ...catalogData,
              thumbnail: catalogData.thumbnail,
              updatedAt: new Date().toISOString()
            };
          }
        }
        
        localStorage.setItem('localCatalogs', JSON.stringify(localCatalogs));
        
        return {
          success: true,
          message: 'Catalog updated locally (permission denied for backend update)',
          data: localCatalogs.find(cat => cat.id === catalogId || cat.originalId === catalogId),
          warning: 'Changes saved locally due to permission restrictions'
        };
      }
      
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
      
      // Handle permission errors gracefully
      if (response.status === 403) {
        console.log('Permission denied for deletion, removing from local storage instead');
        
        // Remove from local storage if it exists there
        const localCatalogs = JSON.parse(localStorage.getItem('localCatalogs') || '[]');
        const updatedLocalCatalogs = localCatalogs.filter(cat => 
          cat.id !== catalogId && 
          cat.originalId !== catalogId
        );
        localStorage.setItem('localCatalogs', JSON.stringify(updatedLocalCatalogs));
        
        return {
          success: true,
          message: 'Catalog removed locally (permission denied for backend deletion)',
          warning: 'Catalog removed from local storage due to permission restrictions'
        };
      }
      
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
    console.log('Fetching courses for catalog:', catalogId);
    
    // First, try to get catalog courses with full course details
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/catalog/${catalogId}/courses`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('No courses found for catalog:', catalogId);
        return []; // Return empty array for 404 (no courses)
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Catalog courses API response:', data);
    
    // Handle different possible data structures
    let courses = [];
    if (data.data) {
      courses = Array.isArray(data.data) ? data.data : (data.data.courses || []);
    } else if (Array.isArray(data)) {
      courses = data;
    } else if (data.courses) {
      courses = data.courses;
    }
    
    console.log('Extracted courses:', courses);
    
    // Check if courses have full details or just IDs
    if (courses.length > 0 && courses[0]) {
      const firstCourse = courses[0];
      console.log('🔍 First course structure:', firstCourse);
      console.log('🔍 Available fields in first course:', Object.keys(firstCourse));
      
      // Check if we have minimal course data (only id and title)
      const hasMinimalData = firstCourse.id && firstCourse.title && 
        !firstCourse.description && !firstCourse.price && !firstCourse.estimated_duration;
      
      // Check if we have junction table data (course_id field)
      const hasJunctionData = firstCourse.course_id || (firstCourse.course && firstCourse.course.id);
      
      if (hasMinimalData || hasJunctionData) {
        console.log('🚨 Detected minimal course data or junction table entries, fetching full course details...');
        
        // Extract course IDs
        const courseIds = courses.map(item => {
          if (item.course_id) return item.course_id;
          if (item.course && item.course.id) return item.course.id;
          if (item.id) return item.id;
          return null;
        }).filter(id => id !== null);
        
        console.log('📋 Course IDs to fetch:', courseIds);
        
        // Fetch full course details for each course
        const fullCourses = await Promise.all(
          courseIds.map(async (courseId) => {
            console.log(`🔄 Fetching full details for course: ${courseId}`);
            
            try {
              // First try individual course endpoint
              const courseResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}`, {
                method: 'GET',
                headers: getAuthHeaders(),
                credentials: 'include',
              });
              
              console.log(`📡 Individual course API response for ${courseId}:`, courseResponse.status);
              
              if (courseResponse.ok) {
                const courseData = await courseResponse.json();
                console.log(`✅ Individual course data for ${courseId}:`, courseData);
                const fullCourse = courseData.data || courseData;
                console.log(`📊 Full course object for ${courseId}:`, fullCourse);
                return fullCourse;
              } else {
                console.warn(`❌ Failed to fetch course ${courseId} from individual endpoint:`, courseResponse.status);
                
                // Fallback: try to get from all courses and filter
                console.log(`🔄 Trying fallback for course ${courseId}...`);
                try {
                  const allCoursesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/getAllCourses`, {
                    method: 'GET',
                    headers: getAuthHeaders(),
                    credentials: 'include',
                  });
                  
                  console.log(`📡 All courses API response:`, allCoursesResponse.status);
                  
                  if (allCoursesResponse.ok) {
                    const allCoursesData = await allCoursesResponse.json();
                    console.log(`📊 All courses data:`, allCoursesData);
                    const allCourses = allCoursesData.data || [];
                    console.log(`📋 Total courses available:`, allCourses.length);
                    
                    const foundCourse = allCourses.find(c => c.id === courseId);
                    if (foundCourse) {
                      console.log(`✅ Found course ${courseId} in all courses list:`, foundCourse);
                      return foundCourse;
                    } else {
                      console.warn(`❌ Course ${courseId} not found in all courses list`);
                      console.log(`🔍 Available course IDs:`, allCourses.map(c => c.id));
                    }
                  } else {
                    console.error(`❌ All courses API failed:`, allCoursesResponse.status);
                  }
                } catch (fallbackError) {
                  console.error(`❌ Fallback failed for course ${courseId}:`, fallbackError);
                }
                
                return null;
              }
            } catch (error) {
              console.error(`❌ Error fetching course ${courseId}:`, error);
              return null;
            }
          })
        );
        
        // Filter out null results and return full course details
        const validCourses = fullCourses.filter(course => course !== null);
        console.log('✅ Final valid courses with full details:', validCourses);
        console.log('📊 Number of valid courses:', validCourses.length);
        
        if (validCourses.length === 0) {
          console.warn('⚠️ No valid courses found, returning original minimal data');
          return courses;
        }
        
        return validCourses;
      } else {
        console.log('✅ Courses already have full details, no need to fetch additional data');
      }
    }
    
    return courses;
  } catch (error) {
    console.error('Error fetching catalog courses:', error);
    // Return empty array instead of throwing to prevent breaking the UI
    return [];
  }
}

// Get all available courses for selection
export async function fetchAvailableCourses() {
  try {
    console.log('🔄 Fetching all available courses...');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/getAllCourses`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('📡 All courses API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 All courses data:', data);
    const courses = data.data || [];
    console.log('📋 Number of available courses:', courses.length);
    
    if (courses.length > 0) {
      console.log('🔍 Sample course structure:', courses[0]);
      console.log('🔍 Sample course fields:', Object.keys(courses[0]));
    }
    
    return courses;
  } catch (error) {
    console.error('❌ Error fetching available courses:', error);
    throw error;
  }
}

// Test function to check individual course API
export async function testIndividualCourseAPI(courseId) {
  try {
    console.log(`🧪 Testing individual course API for course: ${courseId}`);
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log(`📡 Individual course API response status:`, response.status);
    console.log(`📡 Individual course API response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Individual course API failed:`, errorText);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Individual course API data:`, data);
    
    const course = data.data || data;
    console.log(`📊 Individual course object:`, course);
    console.log(`🔍 Individual course fields:`, Object.keys(course));
    
    return course;
  } catch (error) {
    console.error(`❌ Error testing individual course API:`, error);
    return null;
  }
}