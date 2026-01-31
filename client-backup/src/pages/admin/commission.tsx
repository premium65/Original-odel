import { useQuery } from "@tanstack/react-query";
import { 
  Percent, 
  Search,
  DollarSign,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react";
import { useState } from "react";
import type { User } from "@shared/schema";

interface CommissionRecord {
  id: number;
  userId: number;
  amount: number;
  source: string;
  description?: string;
  createdAt: string;
  user?: User;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function AdminCommission() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  // Fetch users for commission data
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch commission history
  const { data: commissions = [] } = useQuery<CommissionRecord[]>({
    queryKey: ["/api/admin/commissions"],
  });

  // Calculate totals from users
  const totalCommission = users.reduce((sum, user) => sum + (user.lifetimeEarnings || 0), 0);
  const totalAdsEarnings = users.reduce((sum, user) => sum + (user.totalAdsWatched || 0) * 1.75, 0); // Approximate
  const usersWithEarnings = users.filter(u => (u.lifetimeEarnings || 0) > 0).length;

  // Filter users for commission view
  const filteredUsers = users
    .filter(u => (u.lifetimeEarnings || 0) > 0)
    .filter(u => 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (b.lifetimeEarnings || 0) - (a.lifetimeEarnings || 0));

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
        <h1 className="text-3xl font-bold text-white">Commission</h1>
        <p className="text-[#9ca3af] mt-1">View commission history and earnings distribution</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Total Commission</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalCommission)}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#8b5cf6]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Ads Earnings</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalAdsEarnings)}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Users with Earnings</p>
              <p className="text-2xl font-bold text-white">{usersWithEarnings}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/20 flex items-center justify-center">
              <Percent className="w-6 h-6 text-[#06b6d4]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Avg Commission</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(usersWithEarnings > 0 ? totalCommission / usersWithEarnings : 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
        <input
          type="text"
          placeholder="Search by username or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
        />
      </div>

      {/* Commission Table */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <div className="flex items-center gap-3">
            <Percent className="w-5 h-5 text-[#10b981]" />
            <h2 className="text-lg font-semibold text-white">User Commission Summary</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a3a4d]">
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Lifetime Earnings</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Current Balance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Ads Watched</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Withdrawn</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="border-b border-[#2a3a4d] hover:bg-[#0f1419]/50">
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-[#f59e0b] text-white' :
                        index === 1 ? 'bg-[#9ca3af] text-white' :
                        index === 2 ? 'bg-[#cd7f32] text-white' :
                        'bg-[#2a3a4d] text-[#9ca3af]'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center text-white font-bold">
                          {user.fullName?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.fullName || user.username}</p>
                          <p className="text-sm text-[#6b7280]">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#10b981] font-semibold">{formatCurrency(user.lifetimeEarnings || 0)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{formatCurrency(user.balance || 0)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#9ca3af]">{user.totalAdsWatched || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#f59e0b]">{formatCurrency(user.totalWithdrawn || 0)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#6b7280]">
                    No commission data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission History */}
      {commissions.length > 0 && (
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
          <div className="p-5 border-b border-[#2a3a4d]">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#8b5cf6]" />
              <h2 className="text-lg font-semibold text-white">Recent Commission History</h2>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {commissions.slice(0, 50).map(commission => (
              <div key={commission.id} className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#10b981]/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[#10b981]" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{commission.user?.username || 'Unknown'}</p>
                    <p className="text-sm text-[#6b7280]">{commission.source} - {commission.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#10b981]">+{formatCurrency(commission.amount)}</p>
                  <p className="text-xs text-[#6b7280]">{formatDate(commission.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
