// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/axios.js";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Drawer,
} from "@mui/material";

const Home = () => {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [selectedPillar, setSelectedPillar] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const { data } = await api.get("/api/auth/user/details");
        if (data.success) {
          setUserDetails(data.user_details);
          const pillars = data.user_details.user_pillar_access.map((upa) => upa.pillar);
          setSelectedPillar(pillars[0] || dummyPillars[0]);
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };
    fetchUserDetails();
  }, []);

  const handlePillarClick = (pillar) => {
    setSelectedPillar(pillar);
  };

  const userName = user?.first_name || "User";

  const dummyPillars = [
    {
      id: "1",
      name: "Finance Basics",
      courses: [
        { id: "c1", name: "Introduction to Budgeting" },
        { id: "c2", name: "Credit Management" },
        { id: "c3", name: "Savings Strategies" },
      ],
    },
  ];

  const pillars = userDetails?.user_pillar_access?.map((upa) => upa.pillar) || dummyPillars;

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: "25%",
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: "25%",
            boxSizing: "border-box",
            bgcolor: "#f5f5f5",
            p: 2,
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Your Pillars
        </Typography>
        <List>
          {pillars.map((pillar) => (
            <ListItem
              button
              key={pillar.id}
              onClick={() => handlePillarClick(pillar)}
              sx={{ bgcolor: selectedPillar?.id === pillar.id ? "#e0e0e0" : "inherit" }}
            >
              <ListItemText primary={pillar.name} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box sx={{ width: "75%", p: 4, overflowY: "auto" }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          Welcome, {userName}!
        </Typography>

        <Box>
          <Typography variant="h6">
            {selectedPillar ? `${selectedPillar.name} Courses` : "Select a Pillar"}
          </Typography>
          {selectedPillar && (
            <List>
              {(selectedPillar.courses || []).map((course) => (
                <ListItem key={course.id}>
                  <ListItemText primary={course.name} />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;