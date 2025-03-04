import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  IconButton,
  AppBar,
  Toolbar,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // Icon for logout
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [letter, setLetter] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [openSuccess, setOpenSuccess] = useState(false); // For successful save
  const [openError, setOpenError] = useState(false); // For save errors
  const [openWarning, setOpenWarning] = useState(false); // For empty letter warning
  const [loading, setLoading] = useState(false); // For loader state

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#1976d2", // Google blue
      },
      secondary: {
        main: "#f50057", // Google red
      },
      background: {
        default: darkMode ? "#121212" : "#ffffff",
        paper: darkMode ? "#1e1e1e" : "#f5f5f5",
      },
    },
    typography: {
      fontFamily: '"Roboto", sans-serif',
    },
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/user", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("Error fetching user:", err);
        window.location.href = "/";
      });
  }, []);

  const saveLetter = () => {
    if (!letter.trim()) {
      setOpenWarning(true);
      return;
    }
    setLoading(true); // Show loader before API call
    axios
      .post(
        "http://localhost:5000/api/save-letter",
        { content: letter },
        { withCredentials: true }
      )
      .then((res) => {
        setOpenSuccess(true);
        setLetter(""); // Clear the textarea after successful save
      })
      .catch((err) => {
        console.error("Error saving letter:", err);
        setOpenError(true);
      })
      .finally(() => setLoading(false)); // Hide loader after API call completes (success or error)
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    axios
      .post("http://localhost:5000/api/logout", {}, { withCredentials: true })
      .then(() => {
        setUser(null); // Clear user state
        window.location.href = "/"; // Redirect to login page
      })
      .catch((err) => {
        console.error("Error logging out:", err);
        alert("Failed to logout. Please try again or contact support.");
      });
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSuccess(false);
    setOpenError(false);
    setOpenWarning(false);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" sx={{ backgroundColor: "primary.main" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Welcome, {user.displayName}
          </Typography>
          <IconButton
            onClick={handleLogout}
            color="inherit"
            aria-label="logout"
            sx={{ mr: 2 }} // Add some margin to separate from dark mode icon
          >
            <ExitToAppIcon />
          </IconButton>
          <IconButton
            onClick={handleDarkModeToggle}
            color="inherit"
            aria-label="toggle dark mode"
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Write Your Letter
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Create and save your letters securely to Google Drive
          </Typography>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              placeholder="Write your letter here..."
              variant="outlined"
              sx={{ backgroundColor: "background.paper", borderRadius: "4px" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<GoogleIcon />}
                onClick={saveLetter}
                disabled={loading}
                sx={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  backgroundColor: "#db4437", // Google red
                  "&:hover": {
                    backgroundColor: "#c23321", // Darker red on hover
                  },
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                  ...(loading && {
                    backgroundColor: "#db4437",
                    cursor: "not-allowed",
                  }),
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Save to Google Drive"
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setLetter("")}
                sx={{ borderColor: "secondary.main", color: "secondary.main" }}
              >
                Clear Letter
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Success Alert */}
      <Snackbar
        open={openSuccess}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity="success"
          sx={{
            backgroundColor: "#4caf50", // Green for success
            color: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            "& .MuiAlert-icon": { color: "#ffffff" },
          }}
        >
          Letter successfully saved to Google Drive!
        </Alert>
      </Snackbar>

      {/* Error Alert */}
      <Snackbar
        open={openError}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity="error"
          sx={{
            backgroundColor: "#f44336", // Red for error
            color: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            "& .MuiAlert-icon": { color: "#ffffff" },
          }}
        >
          Failed to save letter. Please try again or contact support.
        </Alert>
      </Snackbar>

      {/* Warning Alert */}
      <Snackbar
        open={openWarning}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity="warning"
          sx={{
            backgroundColor: "#ff9800", // Orange for warning
            color: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            "& .MuiAlert-icon": { color: "#ffffff" },
          }}
        >
          Please write something before saving!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard;
