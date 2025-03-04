const { google } = require("googleapis");

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

module.exports = { getOrCreateLettersFolder, getOrCreateMonthlySubfolder };
