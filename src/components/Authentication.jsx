// src/components/Authentication.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GoogleIcon from "@mui/icons-material/Google";
import OTPModal from "./OTPModal.jsx";

const Authentication = ({ open, handleClose, isLogin }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [emailForOTP, setEmailForOTP] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phone: "",
    password: "",
    dob: "",
    image: null, // New field for image file
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value, // Handle file input
    }));
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required!");
      return;
    }
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          handleClose();
          navigate(result.role === "admin" ? "/admin" : "/home");
        }
      } else {
        await register(formData);
        setEmailForOTP(formData.email);
        const registrationData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          password: formData.password,
          gender: formData.gender,
          dob: formData.dob,
          image: formData.image, // Include image file
        };
        localStorage.setItem("registrationFormData", JSON.stringify(registrationData));
        setOtpOpen(true);
      }
    } catch (error) {
      setError(error.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:9000/api/auth/google";
  };

  const handleFullClose = () => {
    handleClose();
    navigate("/");
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isLogin ? 400 : 450, // Increased width for signup
    bgcolor: "background.paper",
    borderRadius: "8px",
    boxShadow: 24,
    p: 4,
  };

  const contentStyle = {
    maxHeight: isLogin ? "60vh" : "70vh",
    overflowY: "auto",
  };

  return (
    <>
      <Modal open={open} onClose={handleFullClose}>
        <Box sx={modalStyle}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h5" align="center">
              {isLogin ? "Login" : "Sign Up"}
            </Typography>
            <IconButton onClick={handleFullClose} sx={{ p: 0 }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            sx={{ mb: 2 }}
          >
            Sign {isLogin ? "in" : "up"} with Google
          </Button>
          {error && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Box sx={contentStyle}>
            {!isLogin && (
              <>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label="Gender"
                    required
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Profile Picture"
                  name="image"
                  type="file"
                  inputProps={{ accept: "image/*" }}
                  onChange={handleChange}
                  margin="normal"
                />
              </>
            )}
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            {!isLogin && (
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                margin="normal"
                required
              />
            )}
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
            </Button>
            <Button
              variant="text"
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => navigate(`/auth?mode=${isLogin ? "register" : "login"}`, { replace: true })}
            >
              {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
            </Button>
          </Box>
        </Box>
      </Modal>
      <OTPModal
        open={otpOpen}
        handleClose={() => {
          setOtpOpen(false);
          navigate("/");
        }}
        email={emailForOTP}
      />
    </>
  );
};

export default Authentication;