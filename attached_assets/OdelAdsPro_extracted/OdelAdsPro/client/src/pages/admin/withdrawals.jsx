import React, { useState } from "react";
import AdminLayout from "./layout";
import "./admin.css";

export default function AdminWithdrawals() {
  const [withdrawals] = useState([
    {
      id: "WD001",
      user: "Akalanka Perera",
      phone: "0761234567",
      amount: 2849,
      method: "Bank Transfer",
      bank: "Commercial Bank",
      accountName: "Akalanka Perera",
      accountNumber: "1234567890",
      branch: "Colombo",
      date: "2025-01-27",
      status: "pending",
    },
    {
      id: "WD002",
      user: "Dilani Fernando",
      phone: "0749988776",
      amount: 5600,
      method: "Bank Transfer",
      bank: "BOC",
      accountName: "Dilani F",
      accountNumber: "8899771122",
      branch: "Negombo",
      date: "2025-01-26",
      status: "approved",
    },
    {
      id: "WD003",
      user: "Hashan Silva",
      phone: "0755552211",
      amount: 1900,
      method: "Bank Transfer",
      bank: "HNB",
      accountName: "Hashan S",
      accountNumber: "7788991122",
      branch: "Kandy",
      date: "2025-01-25",
      status: "rejected",
    },
  ]);

  return (
    <AdminLayout>
      <div className="admin-page">

        <h1 className="admin-title">Withdrawals</h1>
        <p className="admin-subtitle">Approve or reject withdrawal requests</p>

        <div className="admin-table-box">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>User</th>
                <th>Mobile</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Bank Info</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id}>
                  <td>{w.id}</td>
                  <td>{w.user}</td>
                  <td>{w.phone}</td>
                  <td>Rs. {w.amount.toLocaleString()}</td>
                  <td>{w.method}</td>

                  <td>
                    {w.bank}<br />
                    {w.accountName}<br />
                    {w.accountNumber}<br />
                    {w.branch}
                  </td>

                  <td>{w.date}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        w.status === "approved"
                          ? "green"
                          : w.status === "pending"
                          ? "yellow"
                          : "red"
                      }`}
                    >
                      {w.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="action-buttons">
                    <button className="btn-sm view">View</button>

                    {w.status === "pending" ? (
                      <>
                        <button className="btn-sm approve">Approve</button>
                        <button className="btn-sm freeze">Reject</button>
                      </>
                    ) : null}
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
