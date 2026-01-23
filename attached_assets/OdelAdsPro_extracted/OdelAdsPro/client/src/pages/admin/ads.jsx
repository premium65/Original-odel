import React, { useState } from "react";
import AdminLayout from "./layout";
import "./admin.css";

export default function AdminAds() {
  const [ads] = useState([
    {
      id: "AD-0001",
      title: "Advertisement 1",
      image: "photo_1.jpg",
      link: "https://example.com/ad1",
      price: 101.75,
      cooldown: "24h",
      active: true,
    },
    {
      id: "AD-0002",
      title: "Advertisement 2",
      image: "photo_2.jpg",
      link: "https://example.com/ad2",
      price: 101.75,
      cooldown: "24h",
      active: true,
    },
    {
      id: "AD-0003",
      title: "Advertisement 3",
      image: "photo_3.jpg",
      link: "https://example.com/ad3",
      price: 101.75,
      cooldown: "24h",
      active: false,
    },
  ]);

  return (
    <AdminLayout>
      <div className="admin-page">

        <h1 className="admin-title">Ads Management</h1>
        <p className="admin-subtitle">
          Control all advertisements shown to users
        </p>

        <div className="admin-table-box">
          <table className="admin-table">

            <thead>
              <tr>
                <th>Ad ID</th>
                <th>Title</th>
                <th>Image</th>
                <th>Link</th>
                <th>Price (LKR)</th>
                <th>Cooldown</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id}>
                  <td>{ad.id}</td>
                  <td>{ad.title}</td>

                  <td>
                    <img
                      src={`/ads/${ad.image}`}
                      alt={ad.title}
                      style={{ width: "60px", borderRadius: "6px" }}
                    />
                  </td>

                  <td>
                    <a href={ad.link} target="_blank" rel="noreferrer">
                      {ad.link}
                    </a>
                  </td>

                  <td>Rs. {ad.price}</td>
                  <td>{ad.cooldown}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        ad.active ? "green" : "red"
                      }`}
                    >
                      {ad.active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>

                  <td className="action-buttons">
                    <button className="btn-sm edit">Edit</button>

                    {ad.active ? (
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

