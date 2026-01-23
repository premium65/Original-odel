import React from "react";
import bg from "../assets/bg-home.jpg";

export default function Features() {
  const features = [
    {
      title: "Register Account",
      desc: "Create your account and wait for admin approval.",
      icon: "📝",
    },
    {
      title: "Click Rating Ads",
      desc: "Complete 28 ads daily — each pays 101.75 LKR.",
      icon: "⭐",
    },
    {
      title: "Earn Money",
      desc: "Milestone Amount increases with every ad you complete.",
      icon: "💰",
    },
    {
      title: "Withdraw Earnings",
      desc: "After 28 ads, request withdrawal to your bank.",
      icon: "🏦",
    },
    {
      title: "Safe & Secure",
      desc: "Your account, earnings, and data are protected.",
      icon: "🔒",
    },
    {
      title: "Admin Monitoring",
      desc: "Admin can freeze/unfreeze and adjust user earnings.",
      icon: "🛡️",
    },
  ];

  return (
    <div
      className="features-bg"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="features-overlay">

        <div className="features-container">

          <h1 className="features-title">Platform Features</h1>
          <p className="features-subtitle">
            Everything you need to know about earning with Rating Ads.
          </p>

          <div className="features-grid">
            {features.map((f, index) => (
              <div key={index} className="feature-box">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="features-section-title">Daily Earnings Breakdown</h2>

          <div className="earn-box">
            <p>🟦 Total Ads: <strong>28 Ads</strong></p>
            <p>💸 Per Ad: <strong>101.75 LKR</strong></p>
            <p>🔥 Daily Earnings: <strong>2,849.00 LKR</strong></p>
            <p>🔐 Withdrawal unlocked: After completing all 28 ads</p>
          </div>

          <h2 className="features-section-title">User Financial Structure</h2>

          <div className="financial-box">
            <p>🎁 Destination Amount: <strong>25,000 LKR</strong> (one-time, removed after first 28 ads)</p>
            <p>💰 Milestone Amount: Withdrawable balance</p>
            <p>🪙 Milestone Reward: Lifetime earnings</p>
            <p>🧮 Daily Ads Cooldown: 24 hours</p>
          </div>

        </div>

      </div>
    </div>
  );
}
