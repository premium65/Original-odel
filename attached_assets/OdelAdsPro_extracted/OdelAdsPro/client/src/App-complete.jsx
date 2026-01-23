import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

// User Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Features from "./pages/Features.jsx";
import Rating from "./pages/Rating.jsx";
import Wallet from "./pages/Wallet.jsx";
import Points from "./pages/Points.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/dashboard.jsx";
import AdminUsers from "./pages/admin/users.jsx";
import AdminPending from "./pages/admin/pending.jsx";
import AdminWithdrawals from "./pages/admin/withdrawals.jsx";
import AdminAds from "./pages/admin/ads.jsx";
import AdminRatings from "./pages/admin/ratings.jsx";
import AdminPremium from "./pages/admin/premium.jsx";
import AdminUserDetail from "./pages/admin/user-detail.jsx";

// Navigation Component
function Navigation() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setUser({ id: userId });
    }
  }, []);

  if (location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <nav style={{ background: "#1a1a2e", padding: "20px", color: "white" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between" }}>
        <h2>Rating-Ads</h2>
        {user && <button onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}>Logout</button>}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <Navigation />
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/features" element={<Features />} />
        <Route path="/rating" element={<Rating />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/points" element={<Points />} />

        {/* ADMIN */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/pending" element={<AdminPending />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
        <Route path="/admin/ads" element={<AdminAds />} />
        <Route path="/admin/ratings" element={<AdminRatings />} />
        <Route path="/admin/premium" element={<AdminPremium />} />
        <Route path="/admin/users/:id" element={<AdminUserDetail />} />
      </Routes>
    </>
  );
}
