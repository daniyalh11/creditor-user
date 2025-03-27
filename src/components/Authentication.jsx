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
    dateOfBirth: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
        await login(formData.email, formData.password);
        navigate("/home"); // Matches your /home route
      } else {
        await register(formData);
        setEmailForOTP(formData.email);
        localStorage.setItem(
          "registrationFormData",
          JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            password: formData.password,
            gender: formData.gender,
            date_of_birth: formData.dateOfBirth,
          })
        );
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
    handleClose(); // Close the current modal
    navigate("/"); // Navigate to landing page to reset auth flow
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isLogin ? 400 : 350,
    bgcolor: "background.paper",
    borderRadius: "8px",
    boxShadow: 24,
    p: 4,
  };

  const contentStyle = {
    maxHeight: isLogin ? "60vh" : "50vh",
    overflowY: "auto",
  };

  return (
    <>
      <Modal open={open} onClose={handleFullClose}>
        <Box sx={modalStyle}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
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
                  name="dateOfBirth"
                  type="date" // Date picker
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  margin="normal"
                  required
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
              onClick={() =>
                navigate(`/auth?mode=${isLogin ? "register" : "login"}`, {
                  replace: true,
                })
              }
            >
              {isLogin
                ? "Need an account? Sign Up"
                : "Already have an account? Login"}
            </Button>
          </Box>
        </Box>
      </Modal>
      <OTPModal
        open={otpOpen}
        handleClose={() => {
          setOtpOpen(false);
          navigate("/"); // Close OTP and return to landing page
        }}
        email={emailForOTP}
      />
    </>
  );
};

export default Authentication;
