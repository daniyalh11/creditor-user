// src/components/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogoutClick = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md fixed top-0 w-full z-50">
      <div className="text-xl font-bold text-teal-600">Logo here</div>
      <div className="ml-auto space-x-10">
        <a href="#" className="text-gray-700 hover:text-teal-500">Catalog</a>
        <a href="#" className="text-gray-700 hover:text-teal-500">Calendar</a>
        <a href="#" className="text-gray-700 hover:text-teal-500">News</a>
        <a href="#" className="text-gray-700 hover:text-teal-500 mr-5">Contact</a>
      </div>
      {user ? (
        <button
          className="bg-teal-500 text-white px-4 py-2 rounded-full shadow-xl"
          onClick={handleLogoutClick}
        >
          Logout
        </button>
      ) : (
        <>
          <button
            className="bg-teal-500 text-white px-4 py-2 rounded-full shadow-xl mr-3"
            onClick={() => navigate("/auth?mode=login")}
          >
            Login
          </button>
          <button
            className="bg-teal-500 text-white px-4 py-2 rounded-full shadow-xl"
            onClick={() => navigate("/auth?mode=register")}
          >
            Signup
          </button>
        </>
      )}
    </nav>
  );
};

export default Navbar;