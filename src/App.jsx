// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import HeroSection from "./components/HeroSection.jsx";
import FeaturesSection from "./components/FeaturesSection.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Admin from "./pages/Admin.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import Authentication from "./components/Authentication.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import Layout from "./components/Layout.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";

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
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === "admin" ? "/admin" : "/home"} />
          ) : (
            <>
              <Navbar />
              <HeroSection />
              <FeaturesSection />
              <Footer />
            </>
          )
        }
      />
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected Routes with Layout */}
      <Route element={<Layout />}>
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
        <Route path="/groups" element={<div>Groups Page (Placeholder)</div>} />
        <Route path="/catalog" element={<div>Catalog Page (Placeholder)</div>} />
        <Route path="/users" element={<div>Users Page (Placeholder)</div>} />
        <Route path="/surveys" element={<div>Surveys Page (Placeholder)</div>} />
        <Route path="/help" element={<div>Help Page (Placeholder)</div>} />
        <Route path="/privacy" element={<div>Privacy Page (Placeholder)</div>} />
        <Route path="/friends" element={<div>Friends Page (Placeholder)</div>} />
        <Route path="/copilot" element={<div>Copilot Page (Placeholder)</div>} />
        <Route path="/login-history" element={<div>Login History Page (Placeholder)</div>} />
        <Route path="/notes" element={<div>Notes Page (Placeholder)</div>} />
      </Route>
    </Routes>
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