import React, { useState } from "react";
import AdminLayout from "./layout";
import "./admin.css";

export default function AdminAdmins() {
  const [admins] = useState([
    {
      id: "ADM001",
      name: "Super Admin",
      email: "super@odel.com",
      role: "Super Admin",
      status: "active",
      created: "2025-01-01",
    },
    {
      id: "ADM002",
      name: "Kasun Manager",
      email: "kasun@odel.com",
      role: "Manager",
      status: "active",
      created: "2025-01-12",
    },
    {
      id: "ADM003",
      name: "Support Team",
      email: "support@odel.com",
      role: "Support",
      status: "inactive",
      created: "2025-01-18",
    },
  ]);

  return (
    <AdminLayout>
      <div className="admin-page">

        <h1 className="admin-title">Admin Accounts</h1>
        <p className="admin-subtitle">Manage all backend admins & roles</p>

        {/* CREATE ADMIN BUTTON */}
        <div style={{ marginBottom: "15px" }}>
          <button
            className="btn-sm approve"
            style={{ fontSize: "14px", padding: "10px 20px" }}
          >
            + Add New Admin
          </button>
        </div>

        <div className="admin-table-box">
          <table className="admin-table">

            <thead>
              <tr>
                <th>Admin ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.name}</td>
                  <td>{a.email}</td>
                  <td>{a.role}</td>
                  <td>{a.created}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        a.status === "active" ? "green" : "red"
                      }`}
                    >
                      {a.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="action-buttons">
                    <button className="btn-sm view">View</button>
                    <button className="btn-sm edit">Edit</button>

                    {a.status === "active" ? (
                      <button className="btn-sm freeze">Disable</button>
                    ) : (
                      <button className="btn-sm approve">Enable</button>
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
