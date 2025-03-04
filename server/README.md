# WarrantyMe Letter App - Server

![Node.js](https://img.shields.io/badge/Node.js-18.18%2B-brightgreen) ![Express.js](https://img.shields.io/badge/Express.js-%5E4.18-blue) ![Google Drive API](https://img.shields.io/badge/Google%20Drive%20API-Enabled-orange)

This is the **server-side** component of the WarrantyMe Letter App, built with **Node.js** and **Express.js**. It manages **Google OAuth authentication**, **role-based access control (RBAC)**, and integrates with **Google Drive** for saving letters.

---

## 🚀 Features

- 🔐 **Secure authentication** with **Google OAuth 2.0**.
- 👤 **Role-based access control** (Admins manage letters, users can create/save them).
- 📁 **Google Drive API integration** for organizing letters into folders.
- ⚡ **RESTful API** for managing user authentication, letters, and session control.
- 🛠 **Session-based authentication** using `express-session`.

---

## 🛠 Prerequisites

Before running this project, ensure you have:

- ✅ **Node.js v18.18+** installed
- ✅ **npm (Node Package Manager)** installed
- ✅ **Google Cloud Project** with **OAuth 2.0** and **Google Drive API** enabled
- ✅ **Google Cloud Credentials** (Client ID, Client Secret, and Redirect URI)

---

## 📥 Installation

### 1️⃣ Clone the repository

```bash
cd server
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create a `.env` file in the `server` directory

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CALLBACK_URL=http://localhost:5000/auth/google/callback
SESSION_SECRET=your-secure-session-secret
```

Replace the placeholders with your **Google OAuth credentials**.

---

## 🛠 Configuration

### 🎯 Google Cloud Setup

- **Enable** Google Drive API & OAuth 2.0.
- **Set Redirect URI** to: `http://localhost:5000/auth/google/callback`
- **Required Scopes:**
  - `profile`
  - `email`
  - `https://www.googleapis.com/auth/drive`

---

## 🚀 Running the Server

```bash
node index.js
```

Server runs on **`http://localhost:5000`**.
Ensure the **client (React app)** is running at **`http://localhost:3000`**.

---

## 🔌 API Endpoints

| Method     | Endpoint                | Description                       | Access              |
| ---------- | ----------------------- | --------------------------------- | ------------------- |
| **GET**    | `/auth/google`          | Start Google OAuth authentication | Public              |
| **GET**    | `/auth/google/callback` | Google OAuth callback             | Public              |
| **GET**    | `/api/user`             | Get authenticated user profile    | Authenticated Users |
| **POST**   | `/api/save-letter`      | Save letter to Google Drive       | Authenticated Users |
| **GET**    | `/api/letters`          | Fetch all letters (Admin only)    | Admin               |
| **DELETE** | `/api/letters/:fileId`  | Delete a letter (Admin only)      | Admin               |
| **POST**   | `/api/logout`           | Logout the user                   | Authenticated Users |

---

## 📂 Project Structure

```
server/
├── index.js          # Main Express server file
├── routes/           # API route handlers
│   ├── authRoutes.js    # Google OAuth routes
│   ├── letterRoutes.js  # Letter CRUD routes
│   └── logoutRoutes.js  # Logout route
├── utils/            # Utility functions
│   ├── roleUtils.js     # RBAC middleware
│   └── driveUtils.js    # Google Drive helpers
├── .env              # Environment variables
└── README.md         # This file
```

---

## 🤝 Contributing

1. **Fork** the repository.
2. **Create a new branch** (`feature-branch-name`).
3. **Commit your changes**.
4. **Submit a Pull Request (PR)**.

---

## 📜 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

🚀 **Happy Coding!** 😊
