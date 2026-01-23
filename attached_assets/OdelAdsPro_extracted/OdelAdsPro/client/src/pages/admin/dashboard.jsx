import React from "react";
import AdminLayout from "./layout";
import "./admin.css";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="admin-page">

        <h1 className="admin-title">Dashboard</h1>
        <p className="admin-subtitle">Welcome, Admin — System Overview</p>

        {/* ---- TOP STATS CARDS ---- */}
        <div className="admin-stats-grid">

          <div className="admin-card blue">
            <h3>Total Users</h3>
            <p className="admin-card-number">1,284</p>
          </div>

          <div className="admin-card green">
            <h3>Approved Users</h3>
            <p className="admin-card-number">1,030</p>
          </div>

          <div className="admin-card yellow">
            <h3>Pending Users</h3>
            <p className="admin-card-number">254</p>
          </div>

          <div className="admin-card purple">
            <h3>Total Withdrawals</h3>
            <p className="admin-card-number">Rs. 392,450</p>
          </div>
        </div>

        {/* ---- LOWER SECTION ---- */}
        <div className="admin-two-col">

          {/* Recent Users */}
          <div className="admin-box">
            <h2 className="admin-box-title">New Registrations</h2>

            <ul className="admin-list">
              <li>⭐ Akalanka Perera — 0761234567</li>
              <li>⭐ Dilani Fernando — 0749876543</li>
              <li>⭐ Hashan Silva — 0755552211</li>
              <li>⭐ Nadeesha Kumari — 0784422311</li>
            </ul>
          </div>

          {/* Withdrawals */}
          <div className="admin-box">
            <h2 className="admin-box-title">Recent Withdrawals</h2>

            <ul className="admin-list">
              <li>💰 Maduka — Rs. 2,849</li>
              <li>💰 Ishara — Rs. 5,600</li>
              <li>💰 Kavindi — Rs. 1,900</li>
              <li>💰 Pradeep — Rs. 3,200</li>
            </ul>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
