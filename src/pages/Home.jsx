// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/axios.js";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Home = () => {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [selectedPillar, setSelectedPillar] = useState(null); // Track selected pillar
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        console.log("Fetching user details for user:", user);
        const { data } = await api.get("/api/users/get/userdetails");
        console.log("API response:", data);
        if (data.success) {
          setUserDetails(data.user);
        } else {
          console.log("API success false:", data);
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [user]);

  const handlePillarClick = (pillar) => {
    setSelectedPillar(pillar);
  };

  const handleBackClick = () => {
    setSelectedPillar(null); // Reset to show pillars
  };

  const userName = user?.first_name || "User";

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!userDetails) {
    return <Typography>No user data available.</Typography>;
  }

  const pillars = userDetails?.user_pillar_access?.map((upa) => upa.pillars) || [];

  return (
    <Box sx={{ display: "flex", height: "100vh", pt: "64px" /* Adjust for navbar height */ }}>
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
        {/* <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h6">Creditor Academy</Typography>
        </Box> */}
        <List>
          {[
            { text: "Home", icon: <HomeIcon /> },
            { text: "Groups", icon: <GroupIcon /> },
            { text: "Catalog", icon: <LibraryBooksIcon /> },
            { text: "Users", icon: <PeopleIcon /> },
            { text: "Surveys", icon: <AssignmentIcon /> },
            { text: "Admin", icon: <SettingsIcon /> },
            { text: "Help", icon: <HelpIcon /> },
          ].map((item) => (
            <ListItem button key={item.text}>
              <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 4, bgcolor: "#F5F7FA" }}>
        {selectedPillar ? (
          // Show Courses for the Selected Pillar
          <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBackClick}
                sx={{ mr: 2 }}
              >
                Back to Pillars
              </Button>
              <Typography variant="h5">
                {selectedPillar.name} Courses
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {selectedPillar.courses.length > 0 ? (
                selectedPillar.courses.map((course) => (
                  <Card
                    key={course.id}
                    sx={{
                      width: "300px",
                      boxShadow: 3,
                      transition: "0.3s",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image="https://via.placeholder.com/300x140?text=Course+Image" // Placeholder image
                      alt={course.title}
                    />
                    <CardContent>
                      <Typography variant="h6">{course.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.description || "No description available"}
                      </Typography>
                      {course.instructor && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Instructor: {course.instructor}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography>No courses available for this pillar.</Typography>
              )}
            </Box>
          </>
        ) : (
          // Show Pillars
          <>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Pillars
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {pillars.length > 0 ? (
                pillars.map((pillar) => (
                  <Card
                    key={pillar.id}
                    sx={{
                      width: "300px",
                      boxShadow: 3,
                      transition: "0.3s",
                      "&:hover": { boxShadow: 6 },
                      cursor: "pointer",
                    }}
                    onClick={() => handlePillarClick(pillar)}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image="https://via.placeholder.com/300x140?text=Pillar+Image"
                      alt={pillar.name}
                    />
                    <CardContent>
                      <Typography variant="h6">{pillar.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pillar.description || "No description available"}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography>No pillars assigned.</Typography>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Home;