WarrantyMe Letter App - Client

This is the client-side of the WarrantyMe Letter App, built with React.js. It provides an intuitive UI for users to authenticate via Google, create and manage letters, and interact with the server API.

🚀 Features

🌐 Google OAuth 2.0 Authentication (Login with Google)

📝 Letter creation & saving to Google Drive

👤 Role-based access control (RBAC)

⚡ API integration with Express backend

🎨 Responsive & user-friendly UI using Styled Components

🛠 Prerequisites

Before running this project, ensure you have:

✅ Node.js v18.18+ installed

✅ npm (Node Package Manager) installed

✅ The backend server running at http://localhost:5000

📥 Installation

1️⃣ Clone the repository

cd client

2️⃣ Install dependencies

npm install

3️⃣ Create a .env file in the client directory

REACT_APP_SERVER_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id

Replace the placeholders with your Google OAuth client ID.

🚀 Running the Client

npm start

The React app runs on http://localhost:3000.

📌 Folder Structure

client/
├── src/
│ ├── components/ # Reusable components
│ ├── pages/ # Application pages (Home, Dashboard, etc.)
│ ├── services/ # API calls using Axios
│ ├── context/ # User authentication & state management
│ ├── App.js # Main component
│ ├── index.js # React DOM entry point
├── .env # Environment variables
├── package.json # Dependencies & scripts
└── README.md # This file

🔌 API Integration

This client communicates with the server API at http://localhost:5000. The key API calls include:

Method

Endpoint

Description

GET

/auth/google

Redirects to Google OAuth

GET

/api/user

Fetches logged-in user details

POST

/api/save-letter

Saves a letter to Google Drive

GET

/api/letters

Fetches all saved letters (Admin only)

DELETE

/api/letters/:fileId

Deletes a letter (Admin only)

POST

/api/logout

Logs out the user

🤝 Contributing

Fork the repository.

Create a new branch (feature-branch-name).

Commit your changes.

Submit a Pull Request (PR).

📜 License

This project is licensed under the MIT License. See the LICENSE file for details.

🚀 Happy Coding! 😊
