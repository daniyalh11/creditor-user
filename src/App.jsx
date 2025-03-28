// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HeroSection from "./components/HeroSection.jsx";
import FeaturesSection from "./components/FeaturesSection.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Admin from "./pages/Admin.jsx";
import Profile from "./pages/Profile.jsx"; // Renamed from Settings.jsx
import Settings from "./pages/Settings.jsx"; // New Settings component
import Authentication from "./components/Authentication.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get("mode");

  return (
    <Authentication
      open={true}
      handleClose={() => navigate("/")}
      isLogin={mode === "login"}
    />
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={user.role === "admin" ? "/admin" : "/home"} />
            ) : (
              <>
                <HeroSection />
                <FeaturesSection />
                <Footer />
              </>
            )
          }
        />
        <Route
          path="/home"
          element={
            <PrivateRoute requiredRole="user">
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole="admin">
              <Admin />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute requiredRole="user">
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute requiredRole="user">
              <Settings />
            </PrivateRoute>
          }
        />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;