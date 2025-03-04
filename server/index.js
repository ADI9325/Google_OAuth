const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { google } = require("googleapis");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const app = express();

// Configure CORS to allow only localhost:3000 and include credentials
app.use(
  cors({
    origin: "http://localhost:3000",
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

// Middleware to check user roles
const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user || !req.user.profile || req.user.profile.role !== role) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

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
      // Example: Assign role based on email domain (e.g., admins have @admin.com)
      let role = "user"; // Default role for regular users
      if (profile.emails && profile.emails[0].value.endsWith("@admin.com")) {
        role = "admin"; // Admin role for specific email domains
      }
      // Alternatively, you could store roles in a database and query here
      return done(null, { profile: { ...profile._json, role }, accessToken });
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Helper function to get or create the "Letters" folder
async function getOrCreateLettersFolder(auth) {
  const drive = google.drive({ version: "v3", auth });

  try {
    const query =
      "name='Letters' and mimeType='application/vnd.google-apps.folder' and trashed=false and 'root' in parents";
    const response = await drive.files.list({
      q: query,
      fields: "files(id, name, parents, createdTime)",
      spaces: "drive",
    });

    let folderId;
    if (response.data.files.length > 0) {
      const sortedFolders = response.data.files.sort(
        (a, b) => new Date(a.createdTime) - new Date(b.createdTime)
      );
      folderId = sortedFolders[0].id;
      console.log(
        "📁 Using existing 'Letters' folder with ID:",
        folderId,
        "Parents:",
        sortedFolders[0].parents
      );
    } else {
      console.log("📁 'Letters' folder not found. Creating one...");
      const fileMetadata = {
        name: "Letters",
        mimeType: "application/vnd.google-apps.folder",
        parents: ["root"],
        properties: { appCreated: "true" },
      };
      const folder = await drive.files.create({
        resource: fileMetadata,
        fields: "id, parents",
      });
      folderId = folder.data.id;
      console.log(
        "✅ 'Letters' folder created with ID:",
        folderId,
        "Parents:",
        folder.data.parents
      );
    }
    return folderId;
  } catch (error) {
    console.error("❌ Error fetching or creating Letters folder:", error);
    throw new Error(`Failed to manage Letters folder: ${error.message}`);
  }
}

// Helper function to get or create a monthly subfolder
async function getOrCreateMonthlySubfolder(auth, parentFolderId) {
  const drive = google.drive({ version: "v3", auth });
  const now = new Date();
  const monthYear = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;

  try {
    const query = `name='${monthYear}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`;
    const response = await drive.files.list({
      q: query,
      fields: "files(id, name, parents)",
      spaces: "drive",
    });

    if (response.data.files.length > 0) {
      console.log(
        `📁 '${monthYear}' subfolder exists with ID:`,
        response.data.files[0].id,
        "Parents:",
        response.data.files[0].parents
      );
      return response.data.files[0].id;
    } else {
      console.log(`📁 '${monthYear}' subfolder not found. Creating one...`);
      const fileMetadata = {
        name: monthYear,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentFolderId],
      };
      const folder = await drive.files.create({
        resource: fileMetadata,
        fields: "id, parents",
      });
      console.log(
        `✅ '${monthYear}' subfolder created with ID:`,
        folder.data.id,
        "Parents:",
        folder.data.parents
      );
      return folder.data.id;
    }
  } catch (error) {
    console.error("❌ Error fetching or creating monthly subfolder:", error);
    throw new Error(`Failed to manage monthly subfolder: ${error.message}`);
  }
}

// Routes
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/drive"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:3000/dashboard");
  }
);

// Get user info including role
app.get("/api/user", (req, res) => {
  if (req.user) {
    res.json(req.user.profile);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// Save letter (accessible by all authenticated users)
app.post("/api/save-letter", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  const { content } = req.body;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: req.user.accessToken });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    const lettersFolderId = await getOrCreateLettersFolder(oauth2Client);
    console.log("Letters folder ID:", lettersFolderId);

    const monthlyFolderId = await getOrCreateMonthlySubfolder(
      oauth2Client,
      lettersFolderId
    );
    console.log("Monthly subfolder ID:", monthlyFolderId);

    const fileMetadata = {
      name: `MyLetter_${Date.now()}.docx`,
      mimeType: "application/vnd.google-apps.document",
      parents: [monthlyFolderId], // Explicitly save in monthly subfolder
    };
    const media = { mimeType: "text/plain", body: content };

    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id, parents", // Include parents in response for debugging
    });

    console.log(
      "✅ Letter saved with ID:",
      file.data.id,
      "Parents:",
      file.data.parents
    );
    res.json({ fileId: file.data.id, folderId: monthlyFolderId });
  } catch (error) {
    console.error("❌ Error saving letter:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get letters (admin only)
app.get("/api/letters", checkRole("admin"), async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: req.user.accessToken });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    const lettersFolderId = await getOrCreateLettersFolder(oauth2Client);
    const response = await drive.files.list({
      q: `'${lettersFolderId}' in parents and mimeType='application/vnd.google-apps.document'`,
      fields: "files(id, name, modifiedTime)",
    });
    res.json({ letters: response.data.files || [] });
  } catch (error) {
    console.error("❌ Error fetching letters:", error);
    res.status(500).json({ error: error.message });
  }
});

// Admin-only route example (e.g., delete a letter)
app.delete("/api/letters/:fileId", checkRole("admin"), async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: req.user.accessToken });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    await drive.files.delete({
      fileId: req.params.fileId,
    });
    res.json({ message: "Letter deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting letter:", error);
    res.status(500).json({ error: error.message });
  }
});

// Logout Route
app.post("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Failed to logout" });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ message: "Failed to destroy session" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
