// src/components/Layout.jsx
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import LockIcon from "@mui/icons-material/Lock";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import HistoryIcon from "@mui/icons-material/History";
import NotesIcon from "@mui/icons-material/Notes";

const Layout = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: "200px",
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: "200px",
            boxSizing: "border-box",
            bgcolor: "#1A3C34",
            color: "white",
            pt: "64px",
          },
        }}
      >
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h6">Creditor Academy</Typography>
        </Box>
        <List>
          {[
            { text: "Home", icon: <HomeIcon />, path: "/home" },
            { text: "Groups", icon: <GroupIcon />, path: "/groups" },
            { text: "Catalog", icon: <LibraryBooksIcon />, path: "/catalog" },
            { text: "Users", icon: <PeopleIcon />, path: "/users" },
            { text: "Surveys", icon: <AssignmentIcon />, path: "/surveys" },
            { text: "Admin", icon: <SettingsIcon />, path: "/admin" },
            { text: "Help", icon: <HelpIcon />, path: "/help" },
            { text: "Profile", icon: <HomeIcon />, path: "/profile" },
            { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
            { text: "Privacy", icon: <LockIcon />, path: "/privacy" },
            { text: "Friends", icon: <PeopleIcon />, path: "/friends" },
            { text: "Copilot", icon: <SmartToyIcon />, path: "/copilot" },
            { text: "Login history", icon: <HistoryIcon />, path: "/login-history" },
            { text: "Notes", icon: <NotesIcon />, path: "/notes" },
          ].map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Navbar />
        <Box sx={{ flexGrow: 1, p: 4, bgcolor: "#F5F7FA" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;