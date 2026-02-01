import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Users, 
  Search,
  Wallet,
  TrendingUp,
  Eye,
  DollarSign
} from "lucide-react";
import { useState } from "react";
import type { User } from "@shared/schema";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function AdminTransactionUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("earnings");

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Calculate totals
  const totalBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);
  const totalEarnings = users.reduce((sum, u) => sum + (u.lifetimeEarnings || 0), 0);
  const totalWithdrawn = users.reduce((sum, u) => sum + (u.totalWithdrawn || 0), 0);

  // Filter and sort users
  const filteredUsers = users
    .filter(u => 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "earnings":
          return (b.lifetimeEarnings || 0) - (a.lifetimeEarnings || 0);
        case "balance":
          return (b.balance || 0) - (a.balance || 0);
        case "withdrawn":
          return (b.totalWithdrawn || 0) - (a.totalWithdrawn || 0);
        case "ads":
          return (b.totalAdsWatched || 0) - (a.totalAdsWatched || 0);
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Transaction Users</h1>
        <p className="text-[#9ca3af] mt-1">User wallet summaries and transaction overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#8b5cf6]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[#06b6d4]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Total Balances</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#10b981]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Total Earnings</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalEarnings)}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Total Withdrawn</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalWithdrawn)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search by username, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 bg-[#1a2332] border border-[#2a3a4d] rounded-xl text-white focus:border-[#10b981] focus:outline-none"
        >
          <option value="earnings">Sort by Earnings</option>
          <option value="balance">Sort by Balance</option>
          <option value="withdrawn">Sort by Withdrawn</option>
          <option value="ads">Sort by Ads Watched</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a3a4d]">
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Current Balance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Lifetime Earnings</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Total Withdrawn</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Ads Watched</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Milestone</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.slice(0, 50).map((user, index) => (
                  <tr key={user.id} className="border-b border-[#2a3a4d] hover:bg-[#0f1419]/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          index < 3 
                            ? 'bg-gradient-to-br from-[#f59e0b] to-[#eab308]' 
                            : 'bg-gradient-to-br from-[#8b5cf6] to-[#6366f1]'
                        }`}>
                          {user.fullName?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.fullName || user.username}</p>
                          <p className="text-sm text-[#6b7280]">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#06b6d4] font-semibold">{formatCurrency(user.balance || 0)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#10b981] font-semibold">{formatCurrency(user.lifetimeEarnings || 0)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#f59e0b] font-semibold">{formatCurrency(user.totalWithdrawn || 0)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{user.totalAdsWatched || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#8b5cf6]">{formatCurrency(user.milestoneReward || 0)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/users/${user.id}`}>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded-lg hover:bg-[#8b5cf6]/30 transition-colors">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">View</span>
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#6b7280]">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
