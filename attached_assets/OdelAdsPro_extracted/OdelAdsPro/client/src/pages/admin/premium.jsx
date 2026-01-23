import React, { useState } from "react";
import AdminLayout from "./layout";
import "./admin.css";

export default function AdminPremium() {
  const [premiumUsers] = useState([
    {
      id: "PRE001",
      name: "Akalanka Perera",
      phone: "0761234567",
      level: "Gold",
      multiplier: "2X Earnings",
      expires: "2025-03-10",
      status: "active",
    },
    {
      id: "PRE002",
      name: "Dilani Fernando",
      phone: "0749988776",
      level: "Silver",
      multiplier: "1.5X Earnings",
      expires: "2025-02-18",
      status: "active",
    },
    {
      id: "PRE003",
      name: "Hashan Silva",
      phone: "0755552211",
      level: "Bronze",
      multiplier: "1.2X Earnings",
      expires: "2025-01-30",
      status: "expired",
    },
  ]);

  return (
    <AdminLayout>
      <div className="admin-page">

        <h1 className="admin-title">Premium Users</h1>
        <p className="admin-subtitle">
          Manage VIP users and bonus earning multipliers
        </p>

        <div className="admin-table-box">
          <table className="admin-table">

            <thead>
              <tr>
                <th>User Code</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Level</th>
                <th>Multiplier</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {premiumUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.phone}</td>
                  <td>{u.level}</td>
                  <td>{u.multiplier}</td>
                  <td>{u.expires}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        u.status === "active" ? "green" : "red"
                      }`}
                    >
                      {u.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="action-buttons">
                    <button className="btn-sm view">View</button>
                    <button className="btn-sm edit">Edit</button>

                    {u.status === "active" ? (
                      <button className="btn-sm freeze">Disable</button>
                    ) : (
                      <button className="btn-sm approve">Activate</button>
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
