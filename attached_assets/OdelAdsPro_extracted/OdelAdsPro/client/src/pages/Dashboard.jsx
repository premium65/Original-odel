import React from "react";
import bg from "../assets/bg-home.jpg";
import { Link } from "wouter";

export default function Dashboard() {
  // These values will come from backend later
  const user = {
    name: "John Doe",
    destinationAmount: 25000,     // stays until first 28 ads complete
    milestoneAmount: 2849,        // withdrawable
    milestoneReward: 6000,        // total earned
    adsCompleted: 12,
    adsTotal: 28,
    status: "Active",
  };

  const adsRemaining = user.adsTotal - user.adsCompleted;

  return (
    <div
      className="dash-bg"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <div className="dash-overlay">

        <div className="dash-container">

          <h2 className="dash-title">Welcome, {user.name}</h2>

          {/* SUMMARY CARDS */}
          <div className="dash-cards">
            <div className="dash-card">
              <h3>Destination Amount</h3>
              <p>{user.destinationAmount.toLocaleString()} LKR</p>
              <span>This becomes 0 after first 28 ads</span>
            </div>

            <div className="dash-card">
              <h3>Milestone Amount</h3>
              <p>{user.milestoneAmount.toLocaleString()} LKR</p>
              <span>Withdrawable balance</span>
            </div>

            <div className="dash-card">
              <h3>Milestone Reward</h3>
              <p>{user.milestoneReward.toLocaleString()} LKR</p>
              <span>Total earned</span>
            </div>

            <div className="dash-card">
              <h3>Ads Completed</h3>
              <p>{user.adsCompleted} / {user.adsTotal}</p>
              <span>{adsRemaining} Left Today</span>
            </div>

            <div className="dash-card">
              <h3>Account Status</h3>
              <p style={{ color: user.status === "Active" ? "#22c55e" : "#ef4444" }}>
                {user.status}
              </p>
              <span>{user.status === "Active" ? "Healthy" : "Restricted"}</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="dash-buttons">
            <Link href="/rating">
              <button className="dash-btn primary">Click Rating Ads</button>
            </Link>

            <Link href="/wallet">
              <button className="dash-btn secondary">Wallet</button>
            </Link>

            <Link href="/withdraw">
              <button className="dash-btn secondary">Withdraw</button>
            </Link>

            <Link href="/points">
              <button className="dash-btn secondary">Points</button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
