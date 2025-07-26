// SCORM Service for handling backend API calls
// Replace the base URL with your actual backend API endpoint

class ScormService {
  // Fetch course data from backend
  static async fetchCourseData(courseId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/courses/${courseId}/scorm`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching course data:', error);
      throw error;
    }
  }

  static async updateCourseProgress(courseId, moduleId, progress) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/courses/${courseId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          moduleId,
          progress,
          timestamp: new Date().toISOString()
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating course progress:', error);
      throw error;
    }
  }

  static async markModuleCompleted(courseId, moduleId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/courses/${courseId}/modules/${moduleId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error marking module as completed:', error);
      throw error;
    }
  }

  static async getUserProgress(courseId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/courses/${courseId}/user-progress`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  static async saveScormSession(courseId, moduleId, sessionData) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scorm/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          moduleId,
          sessionData,
          timestamp: new Date().toISOString()
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving SCORM session:', error);
      throw error;
    }
  }

  static async getScormSession(courseId, moduleId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scorm/session/${courseId}/${moduleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching SCORM session:', error);
      throw error;
    }
  }

  static async getCourseAnalytics(courseId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/courses/${courseId}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      throw error;
    }
  }
}

export default ScormService; 