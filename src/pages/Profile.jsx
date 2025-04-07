// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/axios.js";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Tabs,
  Tab,
  TextField,
  CircularProgress,
} from "@mui/material";
import defaultAvatar from "../assets/default-avatar.png";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    gender: "",
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const { data } = await api.get("/api/users/userDashboard");
        if (data.success) {
          const details = data.user_details;
          setUserDetails(details);
          setFormData({
            first_name: details.first_name || "",
            last_name: details.last_name || "",
            phone: "",
            gender: "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData({
      first_name: userDetails?.first_name || "",
      last_name: userDetails?.last_name || "",
      phone: "",
      gender: "",
    });
  };

  const userImage = userDetails?.image || defaultAvatar;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!userDetails) {
    return <Typography>No user data available.</Typography>;
  }

  return (
    <Box sx={{ display: "flex" }}>
      {/* Left Section: Profile Info */}
      <Box sx={{ width: "70%", pr: 2 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            src={userImage}
            alt={userDetails?.first_name}
            sx={{ width: 80, height: 80, mr: 2 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {userDetails.first_name} {userDetails.last_name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Creditor Academy
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => setEditMode(true)}
            sx={{
              borderColor: "#1A3C34",
              color: "#1A3C34",
              "&:hover": { borderColor: "#145a4b", color: "#145a4b" },
            }}
          >
            Edit
          </Button>
        </Box>

        {/* Tabs */}
        {!editMode && (
          <>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                mb: 3,
                "& .MuiTab-root": { textTransform: "none", fontSize: "1rem" },
                "& .Mui-selected": { color: "#1A3C34", fontWeight: "bold" },
                "& .MuiTabs-indicator": { backgroundColor: "#1A3C34" },
              }}
            >
              <Tab label="About" />
              <Tab label="Info" />
              <Tab label="Enrolled" />
              <Tab label="Teaching" />
              <Tab label="Groups" />
            </Tabs>

            {/* Tab Content */}
            {tabValue === 0 && (
              <Box sx={{ p: 3, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                  About
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  There is currently no information about this member.
                </Typography>
              </Box>
            )}
            {tabValue === 1 && (
              <Box sx={{ p: 3, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                  Info
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Joined:</strong>{" "}
                  {userDetails.created_at
                    ? new Date(userDetails.created_at).toLocaleDateString()
                    : "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Last activity:</strong> N/A
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>LMS ID:</strong> N/A
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Tags:</strong> none
                </Typography>
              </Box>
            )}
            {tabValue === 2 && (
              <Box sx={{ p: 3, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                  Enrolled
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No enrolled courses available.
                </Typography>
              </Box>
            )}
            {tabValue === 3 && (
              <Box sx={{ p: 3, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                  Teaching
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No teaching courses available.
                </Typography>
              </Box>
            )}
            {tabValue === 4 && (
              <Box sx={{ p: 3, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                  Groups
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No groups available.
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Edit Form */}
        {editMode && (
          <Box sx={{ p: 3, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
              Edit Profile
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  src={userImage}
                  alt={userDetails?.first_name}
                  sx={{ width: 80, height: 80, cursor: "pointer" }}
                  onClick={() => document.getElementById("image-upload").click()}
                />
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outlined"
                  onClick={() => document.getElementById("image-upload").click()}
                  sx={{
                    borderColor: "#1A3C34",
                    color: "#1A3C34",
                    "&:hover": { borderColor: "#145a4b", color: "#145a4b" },
                  }}
                >
                  Change Photo
                </Button>
              </Box>
              <TextField
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
              />
              <TextField
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  sx={{
                    bgcolor: "#1A3C34",
                    "&:hover": { bgcolor: "#145a4b" },
                    textTransform: "none",
                    px: 4,
                  }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancelEdit}
                  sx={{
                    borderColor: "#1A3C34",
                    color: "#1A3C34",
                    "&:hover": { borderColor: "#145a4b", color: "#145a4b" },
                    textTransform: "none",
                    px: 4,
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Right Sidebar: Account Details */}
      {!editMode && (
        <Box sx={{ width: "30%", p: 3, bgcolor: "white", borderRadius: 2, boxShadow: 1, height: "fit-content" }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Account
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Joined:</strong>{" "}
            {userDetails.created_at
              ? new Date(userDetails.created_at).toLocaleDateString()
              : "N/A"}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Added by:</strong> Edtech Support
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Last activity:</strong> 2 minutes ago
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>LMS ID:</strong> 8054289
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Tags:</strong> none
          </Typography>
          <Typography
            variant="body2"
            color="primary"
            sx={{ mb: 1, cursor: "pointer", fontWeight: "medium" }}
          >
            Login credentials
          </Typography>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: "pointer", fontWeight: "medium" }}
          >
            Reset password
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Profile;