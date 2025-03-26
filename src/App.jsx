// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HeroSection from "./components/HeroSection.jsx";
import FeaturesSection from "./components/FeaturesSection.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Authentication from "./components/Authentication.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Now defined with import
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
              <Navigate to="/home" />
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
            <PrivateRoute>
              <Home />
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