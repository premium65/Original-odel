import React from "react";
import bg from "../assets/bg-home.jpg";

export default function WalletPage() {
  // Later these values come from backend
  const user = {
    destinationAmount: 25000,
    milestoneAmount: 2849,
    milestoneReward: 6000,
    totalEarnings: 12000,
    deposits: [
      { id: 1, amount: 3000, date: "2025-01-09" },
      { id: 2, amount: 1500, date: "2025-01-05" },
    ],
    withdrawals: [
      { id: 1, amount: 2000, status: "Approved", date: "2025-01-10" },
      { id: 2, amount: 1500, status: "Pending", date: "2025-01-07" },
    ],
    transactions: [
      { id: 1, type: "Earned", amount: 101.75, date: "2025-01-11" },
      { id: 2, type: "Earned", amount: 101.75, date: "2025-01-10" },
    ],
  };

  return (
    <div
      className="wallet-bg"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <div className="wallet-overlay">

        <div className="wallet-container">

          <h2 className="wallet-title">My Wallet</h2>

          {/* TOP SUMMARY CARDS */}
          <div className="wallet-cards">
            <div className="wallet-card">
              <h3>Destination Amount</h3>
              <p>{user.destinationAmount.toLocaleString()} LKR</p>
            </div>

            <div className="wallet-card">
              <h3>Milestone Amount</h3>
              <p>{user.milestoneAmount.toLocaleString()} LKR</p>
            </div>

            <div className="wallet-card">
              <h3>Total Earnings</h3>
              <p>{user.totalEarnings.toLocaleString()} LKR</p>
            </div>

            <div className="wallet-card">
              <h3>Milestone Reward</h3>
              <p>{user.milestoneReward.toLocaleString()} LKR</p>
            </div>
          </div>

          {/* DEPOSIT HISTORY */}
          <h3 className="section-title">Deposit History</h3>
          <div className="wallet-list">
            {user.deposits.map((d) => (
              <div key={d.id} className="wallet-row">
                <p>+ {d.amount.toLocaleString()} LKR</p>
                <span>{d.date}</span>
              </div>
            ))}
          </div>

          {/* WITHDRAWALS */}
          <h3 className="section-title">Withdrawals</h3>
          <div className="wallet-list">
            {user.withdrawals.map((w) => (
              <div key={w.id} className="wallet-row">
                <p>- {w.amount.toLocaleString()} LKR</p>
                <span>
                  {w.status} | {w.date}
                </span>
              </div>
            ))}
          </div>

          {/* TRANSACTIONS */}
          <h3 className="section-title">Transactions</h3>
          <div className="wallet-list">
            {user.transactions.map((t) => (
              <div key={t.id} className="wallet-row">
                <p>
                  {t.type === "Earned" ? "+" : "-"}{" "}
                  {t.amount.toLocaleString()} LKR
                </p>
                <span>{t.date}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
