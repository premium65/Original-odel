import React, { useState } from "react";
import AdminLayout from "./layout";
import "./admin.css";

export default function AdminTransactions() {
  const [transactions] = useState([
    {
      id: "TXN001",
      user: "Akalanka Perera",
      phone: "0761234567",
      type: "Deposit",
      amount: 20000,
      date: "2025-01-26",
      method: "Bank Transfer",
      status: "completed",
    },
    {
      id: "TXN002",
      user: "Dilani Fernando",
      phone: "0749988776",
      type: "Withdrawal",
      amount: 5600,
      date: "2025-01-25",
      method: "Bank Transfer",
      status: "completed",
    },
    {
      id: "TXN003",
      user: "Hashan Silva",
      phone: "0755552211",
      type: "Earning",
      amount: 2849,
      date: "2025-01-24",
      method: "Ads Click",
      status: "completed",
    },
    {
      id: "TXN004",
      user: "Support Adjustment",
      phone: "-",
      type: "Admin Update",
      amount: -1000,
      date: "2025-01-24",
      method: "Adjustment",
      status: "manual",
    },
  ]);

  return (
    <AdminLayout>
      <div className="admin-page">

        <h1 className="admin-title">Transactions</h1>
        <p className="admin-subtitle">
          Complete history of all financial activities
        </p>

        {/* FILTERS */}
        <div className="detail-box" style={{ marginBottom: "20px" }}>
          <h2 className="detail-title">Filters</h2>

          <div style={{ display: "flex", gap: "15px" }}>
            <select className="btn-sm view" style={{ padding: "10px" }}>
              <option>All Types</option>
              <option>Deposit</option>
              <option>Withdrawal</option>
              <option>Earning</option>
              <option>Admin Update</option>
            </select>

            <select className="btn-sm view" style={{ padding: "10px" }}>
              <option>Status: All</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>Rejected</option>
              <option>Manual</option>
            </select>

            <button className="btn-sm approve" style={{ padding: "10px 20px" }}>
              Apply
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="admin-table-box">
          <table className="admin-table">

            <thead>
              <tr>
                <th>TXN ID</th>
                <th>User</th>
                <th>Mobile</th>
                <th>Type</th>
                <th>Amount (LKR)</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.user}</td>
                  <td>{t.phone}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        t.type === "Deposit"
                          ? "blue"
                          : t.type === "Withdrawal"
                          ? "yellow"
                          : t.type === "Admin Update"
                          ? "red"
                          : "green"
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>

                  <td>
                    {t.amount < 0
                      ? `- Rs. ${Math.abs(t.amount).toLocaleString()}`
                      : `Rs. ${t.amount.toLocaleString()}`}
                  </td>

                  <td>{t.date}</td>
                  <td>{t.method}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        t.status === "completed"
                          ? "green"
                          : t.status === "manual"
                          ? "yellow"
                          : "red"
                      }`}
                    >
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </AdminLayout>
  );
}
