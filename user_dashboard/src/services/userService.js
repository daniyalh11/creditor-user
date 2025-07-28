// Service for user profile API calls

export async function fetchUserProfile() {
  try {
    console.log("🔍 userService: Fetching profile from:", `${import.meta.env.VITE_API_BASE_URL}/api/user/getUserProfile`);
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/getUserProfile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    console.log("🔍 userService: Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ userService: Fetch profile failed:", response.status, errorText);
      throw new Error(`Failed to fetch user profile: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log("✅ userService: Fetch profile success:", result);
    return result.data; // Return only the user object
  } catch (error) {
    console.error("❌ userService: Fetch profile error:", error);
    throw error;
  }
}

export async function updateUserProfile(profileData) {
  try {
    console.log("📤 userService: Updating profile to:", `${import.meta.env.VITE_API_BASE_URL}/api/user/updateUserProfile`);
    console.log("📤 userService: Update data:", profileData);
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/updateUserProfile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });
    
    console.log("🔍 userService: Update response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ userService: Update profile failed:", response.status, errorText);
      throw new Error(`Failed to update user profile: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log("✅ userService: Update profile success:", result);
    return result;
  } catch (error) {
    console.error("❌ userService: Update profile error:", error);
    throw error;
  }
}