const express = require("express");
const { google } = require("googleapis");
const router = express.Router();
const { checkRole } = require("../utils/roleUtils");
const {
  getOrCreateLettersFolder,
  getOrCreateMonthlySubfolder,
} = require("../utils/driveUtils");

// Save letter (accessible by all authenticated users)
router.post("/api/save-letter", async (req, res) => {
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
router.get("/api/letters", checkRole("admin"), async (req, res) => {
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
router.delete("/api/letters/:fileId", checkRole("admin"), async (req, res) => {
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

module.exports = router;
