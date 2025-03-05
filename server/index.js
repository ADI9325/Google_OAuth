const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const app = express();

// Configure CORS to allow only localhost:3000 and include credentials
app.use(
  cors({
    origin: "https://google-oauth-frontend.onrender.com",
    credentials: true,
  })
);

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Import routes
const authRoutes = require("./routes/authRoutes");
const letterRoutes = require("./routes/letterRoutes");
const logoutRoutes = require("./routes/logoutRoutes");

app.use("/", authRoutes);
app.use("/", letterRoutes);
app.use("/", logoutRoutes);

// Start the server
app.listen(5000, () => console.log("Server running on port 5000"));
