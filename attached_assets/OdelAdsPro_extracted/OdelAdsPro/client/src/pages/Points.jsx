import React from "react";
import bg from "../assets/bg-home.jpg";

export default function PointsPage() {
  // Later this will come from backend
  const user = {
    bonusPoints: 120,
    referralPoints: 40,
    commissionAmount: 850,
    totalPoints: 160,
    level: "Silver",
    nextLevel: "Gold",
    progress: 55, // percent progress
  };

  return (
    <div
      className="points-bg"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="points-overlay">

        <div className="points-container">

          <h1 className="points-title">My Points</h1>
          <p className="points-subtitle">
            Track your bonuses, referrals, and commission levels.
          </p>

          {/* POINTS TOP CARDS */}
          <div className="points-cards">
            <div className="points-card">
              <h3>Bonus Points</h3>
              <p>{user.bonusPoints}</p>
            </div>

            <div className="points-card">
              <h3>Referral Points</h3>
              <p>{user.referralPoints}</p>
            </div>

            <div className="points-card">
              <h3>Commission Earned</h3>
              <p>{user.commissionAmount} LKR</p>
            </div>

            <div className="points-card">
              <h3>Total Points</h3>
              <p>{user.totalPoints}</p>
            </div>
          </div>

          {/* LEVEL SECTION */}
          <h2 className="points-section-title">Your Level</h2>

          <div className="level-box">
            <p className="level-current">
              Current Level: <strong>{user.level}</strong>
            </p>

            <div className="level-progress">
              <div
                className="level-progress-bar"
                style={{ width: `${user.progress}%` }}
              ></div>
            </div>

            <p className="level-next">
              Next Level: <strong>{user.nextLevel}</strong>
            </p>
          </div>

          {/* RANK STRUCTURE */}
          <h2 className="points-section-title">Rank Structure</h2>

          <div className="rank-grid">
            <div className="rank-box">🥉 Bronze — 0+ Points</div>
            <div className="rank-box">🥈 Silver — 100+ Points</div>
            <div className="rank-box">🥇 Gold — 250+ Points</div>
            <div className="rank-box">💎 Platinum — 600+ Points</div>
            <div className="rank-box">👑 Diamond — 1200+ Points</div>
          </div>

        </div>

      </div>
    </div>
  );
}
