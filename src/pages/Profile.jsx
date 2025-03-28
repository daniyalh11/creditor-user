// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/axios.js";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import defaultAvatar from "../assets/default-avatar.png";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    gender: "",
  });
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const { data } = await api.get("/api/users/userDashboard");
        if (data.success) {
          const details = data.user_details;
          setUserDetails(details);
          // Populate formData with fetched details
          setFormData({
            first_name: details.first_name || "",
            last_name: details.last_name || "",
            phone: details.phone || "",
            gender: details.gender || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      } finally {
        setLoading(false); // Set loading to false after fetch
      }
    };
    fetchUserDetails();
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const { data } = await api.post("/api/auth/user/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (data.success) {
          setUserDetails((prev) => ({ ...prev, image: data.imageUrl }));
          await refreshUser();
        }
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const { data } = await api.put("/api/user/update", formData);
      if (data.success) {
        setUserDetails((prev) => ({ ...prev, ...formData }));
        setEditMode(false);
        await refreshUser();
      }
    } catch (error) {
      console.error("Failed to update user details:", error);
    }
  };

  const userImage = userDetails?.image || defaultAvatar;

  if (loading) {
    return <Typography>Loading...</Typography>; // Show loading state
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", p: 4 }}>
      {/* Home Icon */}
      <IconButton
        onClick={() => navigate("/home")}
        sx={{ position: "absolute", top: 16, left: 16 }}
      >
        <HomeIcon fontSize="large" />
      </IconButton>

      {/* Left Div: Image and Basic Info */}
      <Box sx={{ width: "30%", display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
        <Avatar
          src={userImage}
          alt={user?.first_name}
          sx={{ width: 150, height: 150, mb: 2, cursor: "pointer" }}
          onClick={() => document.getElementById("image-upload").click()}
        />
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
        <Typography variant="h5">
          {userDetails?.first_name} {userDetails?.last_name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {userDetails?.role}
        </Typography>
      </Box>

      {/* Right Div: Editable User Details */}
      <Box sx={{ width: "70%", p: 2 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>Profile</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Email"
            value={userDetails?.email || ""}
            disabled
            fullWidth
          />
          <TextField
            label="Date of Birth"
            value={userDetails?.dob ? new Date(userDetails.dob).toISOString().split("T")[0] : ""}
            disabled
            fullWidth
          />
          <TextField
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            disabled={!editMode}
            fullWidth
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            disabled={!editMode}
            fullWidth
          />
          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!editMode}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={!editMode}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={editMode ? handleSave : () => setEditMode(true)}
            sx={{ mt: 2, width: "fit-content" }}
          >
            {editMode ? "Save" : "Edit"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;