// src/components/OTPModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/axios.js";

const OTPModal = ({ open, handleClose, email }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();

  useEffect(() => {
    if (!open) return;

    setTimeLeft(300);
    setAttempts(0);
    setError("");
    setOtp("");

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleClose();
          alert("OTP expired. Please request a new one.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, handleClose]);

  const handleVerify = async () => {
    if (attempts >= 5) {
      setError("Too many attempts. Try again later.");
      return;
    }

    try {
      const storedData = JSON.parse(localStorage.getItem("registrationFormData")) || {};
      const { first_name, last_name, phone, password, gender, dob, image } = storedData;

      const formData = new FormData();
      formData.append("first_name", first_name || "");
      formData.append("last_name", last_name || "");
      formData.append("email", email);
      formData.append("phone", phone || "");
      formData.append("password", password || "");
      formData.append("gender", gender || "");
      formData.append("dob", dob || "");
      formData.append("otp", otp);
      if (image) formData.append("image", image);

      const result = await verifyOtp(otp, email, formData);
      if (result.success) {
        alert("OTP verified successfully!");
        localStorage.removeItem("registrationFormData");
        handleClose();
        navigate(result.role === "admin" ? "/admin" : "/home");
      }
    } catch (err) {
      setError(err.message || "Invalid OTP");
      setAttempts((prev) => prev + 1);
    }
  };

  const handleResendOTP = async () => {
    if (attempts >= 5) {
      alert("Max resend attempts reached.");
      return;
    }

    try {
      const { data } = await api.post("/api/auth/resend-otp", { email });
      if (data.message.includes("otp sent")) {
        alert("New OTP sent to your email.");
        setTimeLeft(300);
        setCanResend(false);
        setTimeout(() => setCanResend(true), 30000); // Enable resend after 30s
      } else {
        throw new Error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      alert(error.message || "Failed to resend OTP. Try again later.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>Enter OTP</Typography>
          <IconButton onClick={handleClose} sx={{ p: 0 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          margin="normal"
        />
        {error && <Typography color="error">{error}</Typography>}
        <Typography variant="body2" sx={{ marginTop: "10px" }}>
          OTP expires in {Math.floor(timeLeft / 60)}:
          {String(timeLeft % 60).padStart(2, "0")}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleVerify}
          disabled={attempts >= 5}
        >
          Verify OTP
        </Button>
        <Button
          variant="text"
          fullWidth
          sx={{ mt: 1 }}
          onClick={handleResendOTP}
          disabled={!canResend || attempts >= 5}
        >
          Resend OTP
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default OTPModal;