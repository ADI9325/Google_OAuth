import React, { useState, useEffect } from "react";
import axios from "axios";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Container,
  Typography,
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
import FormatBoldIcon from "@mui/icons-material/FormatBold"; // For bold
import FormatItalicIcon from "@mui/icons-material/FormatItalic"; // For italic
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted"; // For bullet list
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered"; // For numbered list
import DeleteIcon from "@mui/icons-material/Delete"; // For delete action (admin only)
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [letter, setLetter] = useState(""); // Stores HTML content
  const [darkMode, setDarkMode] = useState(true);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [letters, setLetters] = useState([]); // Store user's letters for admin to manage

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

  const editor = useEditor({
    extensions: [StarterKit],
    content: letter,
    onUpdate: ({ editor }) => {
      setLetter(editor.getHTML()); // Store HTML content
    },
  });

  // Toolbar functions
  const setBold = () => editor.chain().focus().toggleBold().run();
  const setItalic = () => editor.chain().focus().toggleItalic().run();
  const setBulletList = () => editor.chain().focus().toggleBulletList().run();
  const setOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const setHeading = (level) =>
    editor.chain().focus().toggleHeading({ level }).run();

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/user`, { withCredentials: true })
      .then((res) => {
        setUser(res.data);
        if (res.data.role === "admin") {
          fetchLetters(); // Fetch letters only for admins
        }
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        window.location.href = "/";
      });
  }, []);

  // Fetch letters (admin only) - now via backend endpoint
  const fetchLetters = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/letters`, {
        withCredentials: true,
      });
      setLetters(response.data.letters || []);
    } catch (error) {
      console.error("Error fetching letters:", error);
      setOpenError(true);
      setErrorMessage("Failed to fetch letters. Please try again.");
    }
  };

  const saveLetter = () => {
    if (!letter.trim()) {
      setOpenWarning(true);
      return;
    }
    setLoading(true);
    axios
      .post(
        `${BASE_URL}/api/save-letter`,
        { content: letter }, // Send HTML content
        { withCredentials: true }
      )
      .then((res) => {
        setOpenSuccess(true);
        setLetter("");
        editor.commands.clearContent(); // Clear the editor
      })
      .catch((err) => {
        console.error("Error saving letter:", err);
        setOpenError(true);
        if (err.response?.data?.error.includes("folder")) {
          setErrorMessage(
            "Failed to organize in Google Drive folder. Please try again."
          );
        } else {
          setErrorMessage(
            "Failed to save letter. Please try again or contact support."
          );
        }
      })
      .finally(() => setLoading(false));
  };

  const deleteLetter = async (fileId) => {
    if (!user || user.role !== "admin") {
      setOpenError(true);
      setErrorMessage("Access denied. Only admins can delete letters.");
      return;
    }
    setLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/letters/${fileId}`, {
        withCredentials: true,
      });
      setLetters(letters.filter((letter) => letter.id !== fileId));
      setOpenSuccess(true);
    } catch (err) {
      console.error("Error deleting letter:", err);
      setOpenError(true);
      setErrorMessage("Failed to delete letter. Please try again.");
    } finally {
      setLoading(false);
    }
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
            Welcome, {user.displayName} ({user.role})
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
            {/* Rich Text Toolbar */}
            <Box
              sx={{
                backgroundColor: theme.palette.background.paper,
                padding: "8px",
                borderRadius: "4px 4px 0 0",
                borderBottom: `1px solid ${theme.palette.divider}`,
                mb: 1,
              }}
            >
              <IconButton
                onClick={setBold}
                color={editor?.isActive("bold") ? "primary" : "inherit"}
                aria-label="Bold"
                sx={{ mr: 1 }}
              >
                <FormatBoldIcon />
              </IconButton>
              <IconButton
                onClick={setItalic}
                color={editor?.isActive("italic") ? "primary" : "inherit"} // Fixed typo: 'email' to 'editor'
                aria-label="Italic"
                sx={{ mr: 1 }}
              >
                <FormatItalicIcon />
              </IconButton>
              <IconButton
                onClick={setBulletList}
                color={editor?.isActive("bulletList") ? "primary" : "inherit"}
                aria-label="Bullet List"
                sx={{ mr: 1 }}
              >
                <FormatListBulletedIcon />
              </IconButton>
              <IconButton
                onClick={setOrderedList}
                color={editor?.isActive("orderedList") ? "primary" : "inherit"}
                aria-label="Numbered List"
                sx={{ mr: 1 }}
              >
                <FormatListNumberedIcon />
              </IconButton>
              <IconButton
                onClick={() => setHeading(1)}
                color={
                  editor?.isActive("heading", { level: 1 })
                    ? "primary"
                    : "inherit"
                }
                aria-label="Heading 1"
                sx={{ mr: 1 }}
              >
                H1
              </IconButton>
              <IconButton
                onClick={() => setHeading(2)}
                color={
                  editor?.isActive("heading", { level: 2 })
                    ? "primary"
                    : "inherit"
                }
                aria-label="Heading 2"
                sx={{ mr: 1 }}
              >
                H2
              </IconButton>
            </Box>
            {/* Editor Content */}
            <EditorContent
              editor={editor}
              style={{
                height: "300px",
                marginBottom: "16px",
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "0 0 4px 4px",
                padding: "8px",
                overflow: "auto",
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<GoogleIcon />}
                onClick={saveLetter}
                disabled={loading || user.role !== "user"} // Only users can save letters
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
                onClick={() => {
                  setLetter("");
                  editor.commands.clearContent();
                }}
                sx={{ borderColor: "secondary.main", color: "secondary.main" }}
                disabled={loading}
              >
                Clear Letter
              </Button>
              {user.role === "admin" && letters.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Manage Letters</Typography>
                  {letters.map((letter) => (
                    <Box
                      key={letter.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography>{letter.name}</Typography>
                      <IconButton
                        onClick={() => deleteLetter(letter.id)}
                        color="error"
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
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
          Letter successfully saved to the "Letters" folder in Google Drive!
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
          {errorMessage}
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
