import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomeComponent = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout(); // Call the logout function passed from App.jsx
    navigate('/'); // Redirect to the root route (landing page)
  };

  return (
    <>
      <div>This is dashboard</div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogoutClick}
        sx={{ mt: 2 }}
      >
        Logout
      </Button>
    </>
  );
};

export default HomeComponent;