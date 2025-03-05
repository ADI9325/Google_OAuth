const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy; // Add this import
const router = express.Router();
const { checkRole } = require("../utils/roleUtils");

// Passport Google OAuth Setup (assign roles based on email or a custom logic)
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ["profile", "email", "https://www.googleapis.com/auth/drive"],
    },
    (accessToken, refreshToken, profile, done) => {
      let role = "user";
      if (profile.emails && profile.emails[0].value.endsWith("@admin.com")) {
        role = "admin";
      }
      return done(null, { profile: { ...profile._json, role }, accessToken });
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Authentication Routes
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/drive"],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("https://googleoauth-zfac.onrender.com/dashboard");
  }
);

// Get user info including role
router.get("/api/user", (req, res) => {
  if (req.user) {
    res.json(req.user.profile);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

module.exports = router;
