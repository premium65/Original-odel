import { useState } from "react";
import { Users, Search, Eye, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function TransactionUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const [users] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", totalEarned: 125000, totalWithdrawn: 80000, balance: 45000, transactions: 156, lastActive: "2024-01-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", totalEarned: 85000, totalWithdrawn: 50000, balance: 35000, transactions: 98, lastActive: "2024-01-14" },
    { id: 3, name: "Bob Wilson", email: "bob@example.com", totalEarned: 200000, totalWithdrawn: 150000, balance: 50000, transactions: 234, lastActive: "2024-01-15" },
  ]);

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Transaction Users</h1>
            <p className="text-[#9ca3af]">View user transaction summaries</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: "1,234", color: "#8b5cf6" },
          { label: "Active Today", value: "456", color: "#10b981" },
          { label: "Total Earned", value: "LKR 5.2M", color: "#f59e0b" },
          { label: "Total Withdrawn", value: "LKR 3.8M", color: "#3b82f6" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-4">
            <p className="text-[#9ca3af] text-sm">{stat.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6b7280]" />
          <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f1419]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Total Earned</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Withdrawn</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Transactions</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Last Active</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3a4d]">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-[#6b7280] text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#10b981]">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-semibold">LKR {user.totalEarned.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#ef4444]">
                      <TrendingDown className="h-4 w-4" />
                      <span className="font-semibold">LKR {user.totalWithdrawn.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#f59e0b]">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">LKR {user.balance.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{user.transactions}</td>
                  <td className="px-6 py-4 text-[#9ca3af]">{user.lastActive}</td>
                  <td className="px-6 py-4">
                    <button className="w-8 h-8 bg-[#3b82f6]/20 text-[#3b82f6] rounded-lg flex items-center justify-center hover:bg-[#3b82f6]/30">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
