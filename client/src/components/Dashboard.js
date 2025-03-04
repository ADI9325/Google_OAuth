import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [letter, setLetter] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/user", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => (window.location.href = "/"));
  }, []);

  const saveLetter = () => {
    axios
      .post(
        "http://localhost:5000/api/save-letter",
        { content: letter },
        { withCredentials: true }
      )
      .then((res) => alert(`Letter saved with ID: ${res.data.fileId}`))
      .catch((err) => console.error(err));
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome, {user.displayName}</h1>
      <textarea
        value={letter}
        onChange={(e) => setLetter(e.target.value)}
        rows="10"
        cols="50"
        placeholder="Write your letter here..."
      />
      <br />
      <button onClick={saveLetter}>Save to Google Drive</button>
    </div>
  );
};

export default Dashboard;
