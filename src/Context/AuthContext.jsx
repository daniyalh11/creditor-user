// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/axios.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await api.get("/api/auth/check");
        if (data.success) {
          setUser(data.user); // Set full user object from backend
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
        setUser({ email }); // Set minimal user, updated by /check
        return { success: true };
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

  const verifyOtp = async (otp, email, { first_name, last_name, phone, password, gender } = {}) => {
    try {
      const { data } = await api.post("/api/auth/verify-otp", {
        first_name,
        last_name,
        email,
        password,
        phone,
        gender,
        date_of_birth,
        otp,
      });
      if (data.success) {
        setUser({ email }); // Set minimal user, updated by /check
        return { success: true };
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
      value={{ user, loading, login, register, verifyOtp, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);