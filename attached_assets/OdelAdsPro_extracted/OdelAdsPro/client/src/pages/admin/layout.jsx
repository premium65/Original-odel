import React from "react";
import { Link } from "wouter";
import "./admin.css";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="admin-logo">ODEL Admin</h2>

        <ul className="admin-menu">
          <li><Link href="/admin/dashboard">Dashboard</Link></li>
          <li><Link href="/admin/users">Users</Link></li>
          <li><Link href="/admin/pending">Pending</Link></li>
          <li><Link href="/admin/withdrawals">Withdrawals</Link></li>
          <li><Link href="/admin/ratings">Ratings</Link></li>
          <li><Link href="/admin/ads">Ads</Link></li>
          <li><Link href="/admin/deposits">Deposits</Link></li>
          <li><Link href="/admin/commission">Commission</Link></li>
          <li><Link href="/admin/premium">Premium</Link></li>
          <li><Link href="/admin/social-media">Social Media</Link></li>
          <li><Link href="/admin/admins">Admins</Link></li>
          <li><Link href="/admin/transactions">Transactions</Link></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}

