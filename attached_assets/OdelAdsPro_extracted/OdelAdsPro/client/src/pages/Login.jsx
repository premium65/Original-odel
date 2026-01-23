import React, { useState } from "react";
import { Link } from "wouter";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitLogin() {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      alert("Welcome! Login successful.");

      // save session
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userCode", data.userCode);

      window.location.href = "/"; // redirect to home

    } catch (err) {
      setLoading(false);
      alert("Server error");
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>

        <label className="auth-label">Email</label>
        <input
          className="auth-input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="auth-label">Password</label>
        <input
          className="auth-input"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn" onClick={submitLogin}>
          {loading ? "Checking..." : "Login"}
        </button>

        <p className="auth-link">
          <Link href="/">← Back to Home</Link>
        </p>

        <p className="auth-link" style={{ marginTop: "5px" }}>
          <Link href="/register">Create an account →</Link>
        </p>
      </div>
    </div>
  );
}
