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
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [letter, setLetter] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);
  const [loading, setLoading] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: "#1976d2" },
      secondary: { main: "#f50057" },
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
      .get(`${BASE_URL}/api/user`, { withCredentials: true })
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
    setLoading(true);
    axios
      .post(
        `${BASE_URL}/api/save-letter`,
        { content: letter },
        { withCredentials: true }
      )
      .then((res) => {
        setOpenSuccess(true);
        setLetter("");
      })
      .catch((err) => {
        console.error("Error saving letter:", err);
        setOpenError(true);
      })
      .finally(() => setLoading(false));
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    axios
      .post(`${BASE_URL}/api/logout`, {}, { withCredentials: true })
      .then(() => {
        setUser(null);
        window.location.href = "/";
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
            sx={{ mr: 2 }}
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
                  backgroundColor: "#db4437",
                  "&:hover": { backgroundColor: "#c23321" },
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
            backgroundColor: "#4caf50",
            color: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            "& .MuiAlert-icon": { color: "#ffffff" },
          }}
        >
          Letter successfully saved to Google Drive!
        </Alert>
      </Snackbar>

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
            backgroundColor: "#f44336",
            color: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            "& .MuiAlert-icon": { color: "#ffffff" },
          }}
        >
          Failed to save letter. Please try again or contact support.
        </Alert>
      </Snackbar>

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
            backgroundColor: "#ff9800",
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
