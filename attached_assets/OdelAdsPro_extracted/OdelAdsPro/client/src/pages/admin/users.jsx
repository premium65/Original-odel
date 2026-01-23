import React, { useState } from "react";
import AdminLayout from "./layout";
import "./admin.css";

export default function AdminUsers() {
  const [users] = useState([
    {
      id: "USR001",
      name: "Akalanka Perera",
      phone: "0761234567",
      email: "akalanka@mail.com",
      status: "approved",
      balance: 2849,
    },
    {
      id: "USR002",
      name: "Dilani Fernando",
      phone: "0749876543",
      email: "dilani@mail.com",
      status: "pending",
      balance: 0,
    },
    {
      id: "USR003",
      name: "Hashan Silva",
      phone: "0755552211",
      email: "hashan@mail.com",
      status: "frozen",
      balance: 1120,
    },
  ]);

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="admin-title">Users</h1>
        <p className="admin-subtitle">Manage all registered users</p>

        <div className="admin-table-box">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Code</th>
                <th>Full Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Status</th>
                <th>Balance (LKR)</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.phone}</td>
                  <td>{u.email}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        u.status === "approved"
                          ? "green"
                          : u.status === "pending"
                          ? "yellow"
                          : "red"
                      }`}
                    >
                      {u.status.toUpperCase()}
                    </span>
                  </td>

                  <td>Rs. {u.balance.toLocaleString()}</td>

                  <td className="action-buttons">
                    <button className="btn-sm view">View</button>
                    <button className="btn-sm edit">Edit</button>

                    {u.status === "pending" ? (
                      <button className="btn-sm approve">Approve</button>
                    ) : null}

                    {u.status !== "frozen" ? (
                      <button className="btn-sm freeze">Freeze</button>
                    ) : (
                      <button className="btn-sm unfreeze">Unfreeze</button>
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
