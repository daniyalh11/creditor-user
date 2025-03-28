// src/pages/Admin.jsx
import React from "react";
import { Typography, Box } from "@mui/material";

const Admin = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Admin Dashboard</Typography>
      <Typography>Welcome, Admin! Manage users and settings here.</Typography>
    </Box>
  );
};

export default Admin;