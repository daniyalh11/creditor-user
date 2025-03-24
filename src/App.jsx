import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import LoginModal from "./components/LoginModal";
import RegistrationModal from "./components/RegistrationModal";
import Footer from "./components/Footer";
import Home from "./pages/Home";

const App = () => {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (token) => {
    localStorage.setItem("authToken", token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/home" />
            ) : (
              <>
                <Navbar 
                  onLogin={() => setLoginOpen(true)} 
                  onRegister={() => setRegisterOpen(true)} 
                />
                <HeroSection />
                <FeaturesSection />
                <Footer />
                <LoginModal
                  open={isLoginOpen}
                  handleClose={() => setLoginOpen(false)}
                  onLoginSuccess={handleLoginSuccess}
                />
                <RegistrationModal
                  open={isRegisterOpen}
                  handleClose={() => setRegisterOpen(false)}
                />
              </>
            )
          }
        />
        <Route
          path="/home"
          element={isAuthenticated ? <Home onLogout={handleLogout} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
