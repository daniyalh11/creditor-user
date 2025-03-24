import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useSpring, animated } from "@react-spring/web";
import { Google as GoogleIcon } from "@mui/icons-material";

const LoginModal = ({ open, handleClose }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const animation = useSpring({
    opacity: open ? 1 : 0,
    transform: open ? "translateY(0px) scale(1)" : "translateY(-100px) scale(1.1)",
    config: { tension: 200, friction: 18 },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError("All fields are required!");
      return;
    }
    setError("");

    try {
      const response = await fetch("YOUR_BACKEND_LOGIN_URL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        window.location.href = "/home";
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch (err) {
      setError("Server error. Try again later.");
    }
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
            padding: "32px",
            borderRadius: "12px",
            width: "90%",
            maxWidth: "420px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>Log in</h2>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            sx={{ mb: 2, borderColor: "black", color: "black", "&:hover": { backgroundColor: "#f1f1f1" } }}
            onClick={() => (window.location.href = "YOUR_GOOGLE_AUTH_URL")}
          >
            Login with Google
          </Button>

          <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} style={{paddingBottom:"10px"}} />
          <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />

          {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
            <FormControlLabel control={<Checkbox />} label="Remember me" />
            <Button sx={{ fontSize: "12px", textTransform: "none", color: "#007bff" }}>Forgot password?</Button>
          </div>

          <Button variant="contained" fullWidth sx={{ mt: 2, backgroundColor: "#00aaff", "&:hover": { backgroundColor: "#0090dd" } }} onClick={handleLogin}>
            Log in
          </Button>

          <Button variant="text" fullWidth sx={{ mt: 1, color: "gray", textTransform: "none", fontSize: "14px" }} onClick={handleClose}>
            Close
          </Button>
        </Box>
      </animated.div>
    </Modal>
  );
};

export default LoginModal;
