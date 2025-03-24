import React, { useState } from "react";
import LoginModal from "./LoginModal";
import RegistrationModal from "./RegistrationModal"; // Import the Signup Modal

const Navbar = () => {
  const [isLoginOpen, setLoginOpen] = useState(false); // ✅ Login Modal State
  const [isSignupOpen, setSignupOpen] = useState(false); // ✅ Signup Modal State

  return (
    <>
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md fixed top-0 w-full z-50">
        <div className="text-xl font-bold text-teal-600">Logo here</div>
        
        <div className="ml-auto space-x-10">
          <a href="#" className="text-gray-700 hover:text-teal-500">Catalog</a>
          <a href="#" className="text-gray-700 hover:text-teal-500">Calendar</a>
          <a href="#" className="text-gray-700 hover:text-teal-500">News</a>
          <a href="#" className="text-gray-700 hover:text-teal-500 mr-5">Contact</a>
        </div>

        {/* Login Button */}
        <button
          className="bg-teal-500 text-white px-4 py-2 rounded-full shadow-xl mr-3"
          onClick={() => setLoginOpen(true)} // ✅ Open Login Modal
        >
          Login
        </button>

        {/* Signup Button */}
        <button
          className="bg-teal-500 text-white px-4 py-2 rounded-full shadow-xl"
          onClick={() => setSignupOpen(true)} // ✅ Open Signup Modal
        >
          Signup
        </button>
      </nav>

      {/* ✅ Render the Login Modal */}
      <LoginModal open={isLoginOpen} handleClose={() => setLoginOpen(false)} />

      {/* ✅ Render the Signup Modal */}
      <RegistrationModal open={isSignupOpen} handleClose={() => setSignupOpen(false)} />
    </>
  );
};

export default Navbar;
