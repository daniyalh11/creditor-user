import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar"; // Ensure correct path
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import Footer from "./components/Footer";
import HomeComponent from "./pages/Home"; // Ensure correct path
import Authentication from "./components/Authentication";

const AuthPage = ({ setIsAuthenticated }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get("mode");

  return (
    <Authentication
      open={true}
      handleClose={() => window.history.back()}
      isLogin={mode === "login"}
      setIsAuthenticated={setIsAuthenticated}
    />
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
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
            isAuthenticated ? (
              <HomeComponent onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/auth"
          element={<AuthPage setIsAuthenticated={setIsAuthenticated} />}
        />
      </Routes>
    </Router>
  );
};

export default App;