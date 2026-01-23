import { Routes, Route } from "react-router-dom";

// PAGES
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Rating from "./pages/Rating.jsx";
import Wallet from "./pages/Wallet.jsx";
import Features from "./pages/Features.jsx";
import Points from "./pages/Points.jsx";

// ADMIN PAGES
import Dashboard from "./pages/admin/Dashboard.jsx";

export default function App() {
  return (
    <>
      <Routes>

        {/* USER PAGES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rating" element={<Rating />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/features" element={<Features />} />
        <Route path="/points" element={<Points />} />

        {/* ADMIN */}
        <Route path="/admin/dashboard" element={<Dashboard />} />

      </Routes>
    </>
  );
}
