import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserRole, setUserRole as setUserRoleUtil, clearUserData } from '@/services/userService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRoleState] = useState('user');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize user role on mount
    const role = getUserRole();
    setUserRoleState(role);
    setIsLoading(false);

    // Listen for role changes
    const handleRoleChange = () => {
      const newRole = getUserRole();
      setUserRoleState(newRole);
    };

    window.addEventListener('userRoleChanged', handleRoleChange);

    return () => {
      window.removeEventListener('userRoleChanged', handleRoleChange);
    };
  }, []);

  const setUserRole = (role) => {
    setUserRoleUtil(role);
    setUserRoleState(role);
  };

  const logout = () => {
    clearUserData();
    setUserRoleState('user');
  };

  const isInstructorOrAdmin = () => {
    return userRole === 'instructor' || userRole === 'admin';
  };

  const value = {
    userRole,
    setUserRole,
    logout,
    isInstructorOrAdmin,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 