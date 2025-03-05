import React, { useEffect } from "react";
import { Button, Container, Typography, Box } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/user`, {
          withCredentials: true,
        });
        if (response.data) {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Not authenticated:", err);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGoogleLogin = () => {
    window.location.href = `${BASE_URL}/auth/google`;
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          WarrantyMe Letter App
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Sign in to start writing and saving letters
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleLogin}
        sx={{
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: "#db4437",
          "&:hover": { backgroundColor: "#c23321" },
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        }}
      >
        Login with Google
      </Button>
    </Container>
  );
};

export default Login;
