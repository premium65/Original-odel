import React, { useState } from "react";
import AdminLayout from "./layout";
import "./admin.css";

export default function AdminDeposits() {
  const [deposits] = useState([
    {
      id: "DEP001",
      user: "Akalanka Perera",
      phone: "0761234567",
      amount: 20000,
      method: "Bank Transfer",
      slip: "slip1.jpg",
      date: "2025-01-26",
      status: "pending",
    },
    {
      id: "DEP002",
      user: "Dilani Fernando",
      phone: "0749988776",
      amount: 15000,
      method: "Bank Transfer",
      slip: "slip2.jpg",
      date: "2025-01-25",
      status: "approved",
    },
    {
      id: "DEP003",
      user: "Hashan Silva",
      phone: "0755552211",
      amount: 10000,
      method: "Easy Cash",
      slip: "slip3.jpg",
      date: "2025-01-23",
      status: "rejected",
    },
  ]);

  return (
    <AdminLayout>
      <div className="admin-page">

        <h1 className="admin-title">Deposits</h1>
        <p className="admin-subtitle">All user deposit requests</p>

        <div className="admin-table-box">
          <table className="admin-table">

            <thead>
              <tr>
                <th>Deposit ID</th>
                <th>User</th>
                <th>Mobile</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Slip</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {deposits.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.user}</td>
                  <td>{d.phone}</td>
                  <td>Rs. {d.amount.toLocaleString()}</td>
                  <td>{d.method}</td>

                  <td>
                    <img
                      src={`/slips/${d.slip}`}
                      alt="slip"
                      style={{ width: "60px", borderRadius: "6px" }}
                    />
                  </td>

                  <td>{d.date}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        d.status === "approved"
                          ? "green"
                          : d.status === "pending"
                          ? "yellow"
                          : "red"
                      }`}
                    >
                      {d.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="action-buttons">
                    <button className="btn-sm view">View</button>

                    {d.status === "pending" ? (
                      <>
                        <button className="btn-sm approve">Approve</button>
                        <button className="btn-sm freeze">Reject</button>
                      </>
                    ) : (
                      <button className="btn-sm edit">Edit</button>
                    )}
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
