// src/components/Navbar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person"; // Icon for Profile
import defaultAvatar from "../assets/default-avatar.png";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = async () => {
    await logout();
    handleMenuClose();
    navigate("/");
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate("/profile"); // Changed from /settings to /profile
  };

  const handleSettingsClick = () => {
    handleMenuClose();
    navigate("/settings"); // New Settings route
  };

  const userImage = user?.image || defaultAvatar;

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
        <div>
          <IconButton onClick={handleAvatarClick} className="p-0">
            <Avatar src={userImage} alt={user?.first_name} sx={{ width: 36, height: 36 }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleProfileClick}>
              <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">Profile</Typography>
            </MenuItem>
            <MenuItem onClick={handleSettingsClick}>
              <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">Settings</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogoutClick}>
              <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </div>
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