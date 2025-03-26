import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OTPModal = ({
  open,
  handleClose,
  email,
  first_name,
  last_name,
  password,
  phone,
  gender,
}) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    setTimeLeft(300); // Reset OTP timer on open
    setAttempts(0); // Reset attempt counter
    setError(""); // Clear error messages

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleClose();
          alert("OTP expired. Please request a new one.");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  // Handle OTP Verification
  const handleVerify = async () => {
    if (attempts >= 5) return setError("Too many attempts. Try again later.");

    try {
      const response = await axios.post("/api/auth/verify-otp", {
        first_name, // ✅ Now properly passed from props
        last_name,
        email,
        password,
        phone,
        gender,
        otp,
      });

      console.log("OTP Verification Response:", response.data); // ✅ Debugging log

      if (response.data.success) {
        alert("OTP verified successfully!");
        handleClose();
        navigate("/home");
      } else {
        throw new Error(response.data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("OTP Verification Failed:", err); // ✅ Debugging log
      setError("Invalid OTP. Try again.");
      setAttempts((prev) => prev + 1); // ✅ Corrected state update
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (attempts >= 5) return alert("Max resend attempts reached.");

    try {
      await axios.post("/api/auth/resend-otp", { email });
      alert("New OTP sent to your email.");
      setTimeLeft(300); // Reset timer
      setCanResend(false);

      // Enable resend button after 30 seconds
      setTimeout(() => setCanResend(true), 30000);
    } catch (error) {
      alert("Failed to resend OTP. Try again later.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Enter OTP</DialogTitle>
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
          OTP expires in {Math.floor(timeLeft / 60)}:{timeLeft % 60}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleVerify}
        >
          Verify OTP
        </Button>

        <Button
          variant="text"
          fullWidth
          sx={{ mt: 1 }}
          onClick={handleResendOTP}
          disabled={!canResend}
        >
          Resend OTP
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default OTPModal;
