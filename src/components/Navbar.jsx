// src/components/Navbar.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Badge,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MailIcon from "@mui/icons-material/Mail";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import defaultAvatar from "../assets/default-avatar.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To check current route
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
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    handleMenuClose();
    navigate("/settings");
  };

  const userImage = user?.image || defaultAvatar;

  // Determine if we're on a "dashboard" route (authenticated user pages)
  const isDashboardRoute = ["/home", "/profile", "/settings"].includes(location.pathname);

  // Show the authenticated navbar only if user is logged in and on a dashboard route
  if (user && isDashboardRoute) {
    return (
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "white", color: "black" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Creditor Academy
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Search"
            size="small"
            sx={{ mr: 2, bgcolor: "white", borderRadius: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <IconButton sx={{ mr: 1 }}>
            <Badge badgeContent={3} color="primary">
              <MailIcon />
            </Badge>
          </IconButton>
          <IconButton sx={{ mr: 1 }}>
            <Badge badgeContent={1} color="primary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton onClick={handleAvatarClick}>
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
        </Toolbar>
      </AppBar>
    );
  }

  // Otherwise, show the landing page navbar
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md fixed top-0 w-full z-50">
      <div className="text-xl font-bold text-teal-600">Creditor Academy</div>
      <div className="ml-auto space-x-10">
        <a href="#" className="text-gray-700 hover:text-teal-500">Catalog</a>
        <a href="#" className="text-gray-700 hover:text-teal-500">Calendar</a>
        <a href="#" className="text-gray-700 hover:text-teal-500">News</a>
        <a href="#" className="text-gray-700 hover:text-teal-500 mr-5">Contact</a>
      </div>
      <div>
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
      </div>
    </nav>
  );
};

export default Navbar;