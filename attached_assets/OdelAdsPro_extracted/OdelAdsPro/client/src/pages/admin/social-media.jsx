import React, { useState } from "react";
import AdminLayout from "./layout";
import "./admin.css";

export default function AdminSocialMedia() {
  const [links] = useState([
    {
      id: "SM001",
      platform: "Facebook",
      url: "https://facebook.com/odel",
      icon: "📘",
      status: "active",
    },
    {
      id: "SM002",
      platform: "Instagram",
      url: "https://instagram.com/odel",
      icon: "📸",
      status: "active",
    },
    {
      id: "SM003",
      platform: "WhatsApp",
      url: "https://wa.me/94761234567",
      icon: "💬",
      status: "active",
    },
    {
      id: "SM004",
      platform: "Telegram",
      url: "https://t.me/odelgroup",
      icon: "📢",
      status: "inactive",
    },
  ]);

  return (
    <AdminLayout>
      <div className="admin-page">

        <h1 className="admin-title">Social Media</h1>
        <p className="admin-subtitle">
          Manage all official social platform links
        </p>

        <div className="admin-table-box">
          <table className="admin-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Platform</th>
                <th>Icon</th>
                <th>URL</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {links.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.platform}</td>
                  <td style={{ fontSize: "22px" }}>{s.icon}</td>
                  <td>
                    <a href={s.url} target="_blank" rel="noreferrer">
                      {s.url}
                    </a>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        s.status === "active" ? "green" : "red"
                      }`}
                    >
                      {s.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="action-buttons">
                    <button className="btn-sm edit">Edit</button>

                    {s.status === "active" ? (
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
