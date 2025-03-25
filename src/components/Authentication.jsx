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
} from "@mui/material";
import { useSpring, animated } from "@react-spring/web";
import { Google as GoogleIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import OTPModal from "./OTPModal"; // Ensure OTPModal is imported

const Authentication = ({ open, handleClose, isLogin }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const [previewImage, setPreviewImage] = useState(null);
  const [otpOpen, setOtpOpen] = useState(false); // State to control OTP modal
  const [emailForOTP, setEmailForOTP] = useState(""); // Store email for OTP verification

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phone: "",
    password: "",
    // image: null,
  });

  const animation = useSpring({
    opacity: open ? 1 : 0,
    transform: open
      ? "translateY(0px) scale(1)"
      : "translateY(-100px) scale(1.1)",
    config: { tension: 200, friction: 18 },
  });

  // const defaultAvatars = {
  //   male: "/default-male-avatar.png",
  //   female: "/default-female-avatar.png",
  //   other: "/default-avatar.png",
  // };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setFormData({ ...formData, image: file });
  //     setPreviewImage(URL.createObjectURL(file));
  //   }
  // };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError("All fields are required!");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/registerUser";
      const method = "POST";
      let body;

      if (isLogin) {
        body = JSON.stringify({
          email: formData.email,
          password: formData.password,
        });
      } else {
        body = new FormData();
        body.append("firstName", formData.firstName);
        body.append("lastName", formData.lastName);
        body.append("gender", formData.gender);
        body.append("email", formData.email);
        body.append("phone", formData.phone);
        body.append("password", formData.password);
        // body.append(
        //   "image",
        //   formData.image || defaultAvatars[formData.gender || "other"]
        // );
      }

      const response = await fetch(endpoint, {
        method,
        headers: isLogin ? { "Content-Type": "application/json" } : undefined,
        body: isLogin ? body : body,
      });

      const data = await response.json();

      if (data.success) {
        if (isLogin) {
          localStorage.setItem("authToken", data.token);
          navigate("/home");
        } else {
          setEmailForOTP(formData.email); // Save email for OTP verification
          setOtpOpen(true); // Open OTP modal
        }
      } else {
        setError(data.message || "Authentication failed.");
      }
    } catch (error) {
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <>
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
              padding: "32px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "420px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
              textAlign: "center",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              {isLogin ? "Log in" : "Register"}
            </h2>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon />}
              sx={{
                mb: 2,
                borderColor: "black",
                color: "black",
                "&:hover": { backgroundColor: "#f1f1f1" },
              }}
              onClick={handleGoogleSignIn}
            >
              {isLogin ? "Login with Google" : "Sign Up with Google"}
            </Button>

            {!isLogin && (
              <>
                {/* <label htmlFor="image-upload">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                  <Avatar
                    src={
                      previewImage || defaultAvatars[formData.gender || "other"]
                    }
                    sx={{
                      width: 70,
                      height: 70,
                      margin: "auto",
                      cursor: "pointer",
                      mb: 1,
                    }}
                  /> */}
                {/* </label> */}
                {/* <p
                  style={{
                    fontSize: "14px",
                    color: "gray",
                    marginBottom: "10px",
                  }}
                >
                  Upload Image Here
                </p> */}

                <div style={{ display: "flex", gap: "8px" }}>
                  <TextField
                    label="First Name"
                    name="firstName"
                    fullWidth
                    margin="normal"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  <TextField
                    label="Last Name"
                    name="lastName"
                    fullWidth
                    margin="normal"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>

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

                <TextField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  fullWidth
                  margin="normal"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </>
            )}

            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
            />

            {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isLogin ? (
                "Log in"
              ) : (
                "Register"
              )}
            </Button>
          </Box>
        </animated.div>
      </Modal>

      <OTPModal
        open={otpOpen}
        handleClose={() => setOtpOpen(false)}
        email={emailForOTP}
      />
    </>
  );
};

export default Authentication;
