import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Avatar,
  InputLabel,
} from "@mui/material";
import { useSpring, animated } from "@react-spring/web";
import { Google as GoogleIcon } from "@mui/icons-material";

const RegistrationModal = ({ open, handleClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phone: "",
    password: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageName, setImageName] = useState(""); // Stores selected file name

  // Default avatar icons
  const defaultAvatars = {
    male: "/default-male-avatar.png",
    female: "/default-female-avatar.png",
    other: "/default-avatar.png",
  };

  // Smooth Animation
  const animation = useSpring({
    opacity: open ? 1 : 0,
    transform: open
      ? "translateY(0px) scale(1)"
      : "translateY(-100px) scale(1.1)",
    config: { tension: 200, friction: 18 },
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
      setImageName(file.name); // Update image name
    }
  };

  // Handle Registration with OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const imageToUpload = formData.image
      ? formData.image
      : defaultAvatars[formData.gender || "other"];

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("image", imageToUpload);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        alert("OTP sent to your email! Verify to complete registration.");
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In (No OTP required)
  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "5vh",
      }}
    >
      <animated.div style={animation}>
        <Box
          sx={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            width: "90%",
            maxWidth: "420px",
            maxHeight: "90vh",
            overflowY: "auto", // Enables scrolling if content overflows
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            Register
          </h2>

          {/* Profile Image Upload */}
          <label htmlFor="image-upload">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <Avatar
              src={previewImage || defaultAvatars[formData.gender || "other"]}
              sx={{
                width: 70,
                height: 70,
                margin: "auto",
                cursor: "pointer",
                mb: 1,
              }}
            />
          </label>

          {/* Upload Image Text */}
          <p style={{ fontSize: "14px", color: "gray", marginBottom: "10px" }}>
            Upload Image Here
          </p>

          {/* First & Last Name */}
          <div style={{ display: "flex", gap: "8px" }}>
            <TextField
              label="First Name"
              name="firstName"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData.firstName}
              onChange={handleChange}
            />
            <TextField
              label="Last Name"
              name="lastName"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          {/* Gender */}
          <FormControl fullWidth margin="normal">
            <Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select your gender
              </MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </Select>
          </FormControl>

          {/* Email & Phone */}
          <TextField
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            label="Phone Number"
            name="phone"
            type="tel"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.phone}
            onChange={handleChange}
          />

          {/* Password */}
          <TextField
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Register Button */}
          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              backgroundColor: "#00aaff",
              "&:hover": { backgroundColor: "#0090dd" },
            }}
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Register"
            )}
          </Button>

          {/* Google Sign-In */}
          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2, color: "#333", borderColor: "#ddd" }}
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon sx={{ marginRight: "8px" }} /> Sign Up with Google
          </Button>

          {/* Close Button */}
          <Button
            variant="text"
            fullWidth
            sx={{
              mt: 1,
              color: "gray",
              textTransform: "none",
              fontSize: "14px",
            }}
            onClick={handleClose}
          >
            Close
          </Button>
        </Box>
      </animated.div>
    </Modal>
  );
};

export default RegistrationModal;
