import React, { useState } from "react";
import AdminLayout from "./layout";
import "./admin.css";

export default function AdminPending() {
  const [pendingUsers] = useState([
    {
      id: "PEND001",
      name: "Kasun Perera",
      phone: "0761122334",
      email: "kasun@mail.com",
      joined: "2025-01-22",
    },
    {
      id: "PEND002",
      name: "Tharushi Fernando",
      phone: "0749988776",
      email: "tharu@mail.com",
      joined: "2025-01-23",
    },
    {
      id: "PEND003",
      name: "Ishara Dinesh",
      phone: "0754433221",
      email: "ishara@mail.com",
      joined: "2025-01-24",
    },
  ]);

  return (
    <AdminLayout>
      <div className="admin-page">

        <h1 className="admin-title">Pending Users</h1>
        <p className="admin-subtitle">Approve or reject new registrations</p>

        <div className="admin-table-box">
          <table className="admin-table">

            <thead>
              <tr>
                <th>User Code</th>
                <th>Full Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pendingUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.phone}</td>
                  <td>{u.email}</td>
                  <td>{u.joined}</td>

                  <td className="action-buttons">
                    <button className="btn-sm view">View</button>
                    <button className="btn-sm approve">Approve</button>
                    <button className="btn-sm freeze">Reject</button>
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
