
import { Search, Loader2, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Users } from "lucide-react";

export default function AdminTransactionUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users-all"],
    queryFn: api.getUsers,
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.getStats,
  });

  // Calculate real totals if stats endpoint doesn't return them perfectly
  const totalEarned = "0.00"; // Start with 0 until we have a real backend endpoint for 'total earned across all users'
  const totalWithdrawn = stats?.totalWithdrawals ? parseFloat(stats.totalWithdrawals).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#8b5cf6] flex items-center justify-center">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction Users</h1>
          <p className="text-[#9ca3af]">View user transaction summaries</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats?.totalUsers?.toString() || "0", color: "#8b5cf6" },
          { label: "Active Users", value: stats?.activeUsers?.toString() || "0", color: "#10b981" },
          { label: "Total Earned", value: `LKR ${totalEarned}`, color: "#f59e0b" },
          { label: "Total Withdrawn", value: `LKR ${parseFloat(totalWithdrawn).toLocaleString()}`, color: "#3b82f6" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1a2332] border border-[#2a3a4d] rounded-xl p-6">
            <p className="text-[#9ca3af] text-sm mb-2">{stat.label}</p>
            <h3 className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#6b7280]" />
        </div>
        <input
          type="text"
          placeholder="Search users..."
          className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#8b5cf6]"
        />
      </div>

      <div className="bg-[#1a2332] border border-[#2a3a4d] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a3a4d]">
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Total Earned</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Withdrawn</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Transactions</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Last Active</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#6b7280] uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3a4d]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center pt-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#8b5cf6] mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#9ca3af]">No users found.</td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-[#2a3a4d]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-[#6b7280] text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#10b981] font-medium">LKR 0.00</td>
                    <td className="px-6 py-4 text-[#ef4444] font-medium">LKR 0.00</td>
                    <td className="px-6 py-4 text-[#f59e0b] font-medium">LKR {parseFloat(user.balance || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-white">0</td>
                    <td className="px-6 py-4 text-[#9ca3af] text-sm">{new Date(user.registeredAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-[#2a3a4d] rounded-lg text-[#3b82f6] transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
