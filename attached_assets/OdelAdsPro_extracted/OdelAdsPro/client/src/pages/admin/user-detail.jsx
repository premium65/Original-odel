import React from "react";
import AdminLayout from "./layout";
import "./admin.css";

export default function AdminUserDetail() {
  const user = {
    id: "USR001",
    name: "Akalanka Perera",
    phone: "0761234567",
    email: "akalanka@mail.com",
    joined: "2025-01-20",
    status: "approved",
    destinationAmount: 25000,
    milestoneAmount: 2849,
    milestoneReward: 3890,
    adsClicked: 28,
    lastClick: "2025-01-27 10:33 AM",
    bank: {
      bankName: "Commercial Bank",
      accountName: "Akalanka Perera",
      accountNumber: "1234567890",
      branch: "Colombo - Main"
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">

        <h1 className="admin-title">User Details</h1>
        <p className="admin-subtitle">Full profile and account information</p>

        {/* PERSONAL INFO */}
        <div className="detail-box">
          <h2 className="detail-title">Personal Information</h2>

          <div className="detail-row">
            <span>User Code:</span>
            <span>{user.id}</span>
          </div>

          <div className="detail-row">
            <span>Full Name:</span>
            <span>{user.name}</span>
          </div>

          <div className="detail-row">
            <span>Email:</span>
            <span>{user.email}</span>
          </div>

          <div className="detail-row">
            <span>Mobile:</span>
            <span>{user.phone}</span>
          </div>

          <div className="detail-row">
            <span>Joined:</span>
            <span>{user.joined}</span>
          </div>

          <div className="detail-row">
            <span>Status:</span>
            <span
              className={`status-badge ${
                user.status === "approved"
                  ? "green"
                  : user.status === "pending"
                  ? "yellow"
                  : "red"
              }`}
            >
              {user.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* BANK DETAILS */}
        <div className="detail-box">
          <h2 className="detail-title">Bank Information</h2>

          <div className="detail-row">
            <span>Bank:</span>
            <span>{user.bank.bankName}</span>
          </div>

          <div className="detail-row">
            <span>Account Name:</span>
            <span>{user.bank.accountName}</span>
          </div>

          <div className="detail-row">
            <span>Account Number:</span>
            <span>{user.bank.accountNumber}</span>
          </div>

          <div className="detail-row">
            <span>Branch:</span>
            <span>{user.bank.branch}</span>
          </div>
        </div>

        {/* EARNINGS INFO */}
        <div className="detail-box">
          <h2 className="detail-title">Earnings & Activity</h2>

          <div className="detail-row">
            <span>Destination Amount:</span>
            <span>Rs. {user.destinationAmount.toLocaleString()}</span>
          </div>

          <div className="detail-row">
            <span>Milestone Amount:</span>
            <span>Rs. {user.milestoneAmount.toLocaleString()}</span>
          </div>

          <div className="detail-row">
            <span>Milestone Reward:</span>
            <span>Rs. {user.milestoneReward.toLocaleString()}</span>
          </div>

          <div className="detail-row">
            <span>Ads Clicked:</span>
            <span>{user.adsClicked}</span>
          </div>

          <div className="detail-row">
            <span>Last Click:</span>
            <span>{user.lastClick}</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="detail-box">
          <h2 className="detail-title">Admin Actions</h2>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn-sm approve">Approve</button>
            <button className="btn-sm freeze">Freeze</button>
            <button className="btn-sm unfreeze">Unfreeze</button>
            <button className="btn-sm edit">Edit User</button>
            <button className="btn-sm view">Reset Password</button>
            <button className="btn-sm freeze">Delete User</button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
