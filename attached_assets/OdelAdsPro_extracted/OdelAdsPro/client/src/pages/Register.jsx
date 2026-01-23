import React, { useState } from "react";
import { Link } from "wouter";
import bg from "../assets/bg-home.jpg";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    userCode: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function submitRegister(e) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do NOT match!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          mobile: form.mobile,
          password: form.password,
          userCode: form.userCode,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registration success! Your User Code: " + data.userCode);
      window.location.href = "/login"; // redirect

    } catch (err) {
      setLoading(false);
      alert("Server error. Try again.");
    }
  }

  return (
    <div
      className="register-bg"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="register-overlay">
        <div className="register-box">
          <h2 className="register-title">Create Account</h2>

          <form onSubmit={submitRegister} className="register-form">

            <label>Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Enter your full name"
            />

            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="Enter your email"
            />

            <label>Mobile Number</label>
            <input
              type="text"
              value={form.mobile}
              onChange={(e) => update("mobile", e.target.value)}
              placeholder="Enter your mobile number"
            />

            <label>User Code (Optional)</label>
            <input
              value={form.userCode}
              onChange={(e) => update("userCode", e.target.value)}
              placeholder="Enter referral/user code"
            />

            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="Enter password"
            />

            <label>Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              placeholder="Confirm password"
            />

            <button type="submit" className="register-btn">
              {loading ? "Please wait..." : "Register"}
            </button>
          </form>

          <Link href="/login">
            <a className="register-login-link">← Back to Login</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
