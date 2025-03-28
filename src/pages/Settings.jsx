// src/pages/Settings.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", height: "100vh", p: 4 }}>
      {/* Home Icon */}
      <IconButton
        onClick={() => navigate("/home")}
        sx={{ position: "absolute", top: 16, left: 16 }}
      >
        <HomeIcon fontSize="large" />
      </IconButton>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="h4">Settings</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Settings page coming soon! What would you like to configure here?
        </Typography>
      </Box>
    </Box>
  );
};

export default Settings;