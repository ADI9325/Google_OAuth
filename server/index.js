const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { google } = require("googleapis");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // Specify the exact origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
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

// Passport Google OAuth Setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, { profile, accessToken });
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Routes
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/drive.file"],
  })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:3000/dashboard");
  }
);

app.get("/api/user", (req, res) => {
  if (req.user) res.json(req.user.profile);
  else res.status(401).json({ message: "Not authenticated" });
});

app.post("/api/save-letter", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  const { content } = req.body;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: req.user.accessToken });

  const drive = google.drive({ version: "v3", auth: oauth2Client });
  const fileMetadata = {
    name: "MyLetter.docx",
    mimeType: "application/vnd.google-apps.document",
  };
  const media = { mimeType: "text/plain", body: content };

  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id",
    });
    res.json({ fileId: file.data.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
