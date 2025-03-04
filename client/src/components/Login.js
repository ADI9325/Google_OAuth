import React from "react";

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Letter App</h1>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;
