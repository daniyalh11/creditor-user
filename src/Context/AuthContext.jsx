// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/axios.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { data } = await api.get("/api/auth/check");
      if (data.success) {
        setUser(data.user);
        return data.user;
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await api.get("/api/auth/check");
        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error.response?.data || error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      if (data.success) {
        const { data: checkData } = await api.get("/api/auth/check");
        if (checkData.success) {
          setUser(checkData.user);
          return { success: true, role: checkData.user.role };
        }
        throw new Error("Failed to fetch user data after login");
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (formData) => {
    try {
      const { data } = await api.post("/api/auth/registerUser", {
        email: formData.email,
        phone: formData.phone,
      });
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const verifyOtp = async (otp, email, formData) => {
    try {
      const { data } = await api.post(
        "/api/auth/verify-otp",
        { ...formData, otp }, // Spread FormData doesn’t work; use proper FormData
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (data.success) {
        const { data: checkData } = await api.get("/api/auth/check");
        if (checkData.success) {
          setUser(checkData.user);
          return { success: true, role: checkData.user.role };
        }
        throw new Error("Failed to fetch user data after OTP verification");
      } else {
        throw new Error(data.message || "Invalid OTP");
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || "OTP verification failed");
    }
  };

  const logout = async () => {
    try {
      await api.get("/api/auth/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, verifyOtp, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);