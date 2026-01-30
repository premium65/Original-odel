import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Users, 
  Eye, 
  DollarSign, 
  Wallet, 
  PiggyBank, 
  UserCheck,
  Clock,
  TrendingUp,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import type { User, Withdrawal } from "@shared/schema";

// Format currency in Indian Rupees
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount).replace('₹', '₹');
};

export default function AdminDashboard() {
  // Fetch all users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch withdrawals
  const { data: withdrawals = [] } = useQuery<Withdrawal[]>({
    queryKey: ["/api/admin/withdrawals"],
  });

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "active").length;
  const pendingUsers = users.filter(u => u.status === "pending").length;
  
  const totalDeposit = users.reduce((sum, user) => sum + (user.balance || 0), 0);
  const totalCommission = users.reduce((sum, user) => sum + (user.lifetimeEarnings || 0), 0);
  const totalAdsViewed = users.reduce((sum, user) => sum + (user.totalAdsWatched || 0), 0);
  
  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending");
  const totalWithdrawn = withdrawals
    .filter(w => w.status === "approved")
    .reduce((sum, w) => sum + w.amount, 0);

  // Get recent users (last 5)
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-[#9ca3af] mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-right">
          <p className="text-[#6b7280] text-sm">Last updated</p>
          <p className="text-white font-medium">{currentDate}</p>
        </div>
      </div>

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Users */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Total Users</p>
              <h3 className="text-4xl font-bold text-white mt-2">{totalUsers}</h3>
              <p className="text-white/70 text-sm mt-2">
                {activeUsers} active, {pendingUsers} pending
              </p>
              <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 12% from last week
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10"></div>
        </div>

        {/* Total Ads Viewed */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Total Ads Viewed</p>
              <h3 className="text-4xl font-bold text-white mt-2">{totalAdsViewed.toLocaleString()}</h3>
              <p className="text-white/70 text-sm mt-2">All time clicks</p>
              <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 8% from last week
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10"></div>
        </div>

        {/* Total Commission */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Total Commission</p>
              <h3 className="text-4xl font-bold text-white mt-2">{formatCurrency(totalCommission)}</h3>
              <p className="text-white/70 text-sm mt-2">Earnings distributed</p>
              <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 23% from last week
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10"></div>
        </div>
      </div>

      {/* Stats Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Withdraw */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Total Withdraw</p>
              <h3 className="text-4xl font-bold text-white mt-2">{formatCurrency(totalWithdrawn)}</h3>
              <p className="text-white/70 text-sm mt-2">
                {formatCurrency(pendingWithdrawals.reduce((s, w) => s + w.amount, 0))} pending
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10"></div>
        </div>

        {/* Total Deposit */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#06b6d4] to-[#0891b2] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Total Deposit</p>
              <h3 className="text-4xl font-bold text-white mt-2">{formatCurrency(totalDeposit)}</h3>
              <p className="text-white/70 text-sm mt-2">User balances</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10"></div>
        </div>

        {/* Active Users */}
        <div className="relative overflow-hidden rounded-2xl bg-[#1e293b] border border-[#334155] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#9ca3af] text-sm font-medium uppercase tracking-wider">Active Users</p>
              <h3 className="text-4xl font-bold text-white mt-2">{activeUsers}</h3>
              <p className="text-[#6b7280] text-sm mt-2">
                {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}% of total
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#0f172a] flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-[#10b981]" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Priority Actions */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[#2a3a4d]">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#f59e0b]" />
              <h2 className="text-lg font-semibold text-white">High Priority Actions</h2>
            </div>
            <span className="px-3 py-1 text-xs font-semibold bg-[#f59e0b]/20 text-[#f59e0b] rounded-full">
              {pendingUsers + pendingWithdrawals.length} pending
            </span>
          </div>
          <div className="p-4 space-y-3">
            {pendingUsers > 0 && (
              <Link href="/admin/pending">
                <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl hover:bg-[#0f1419]/80 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#8b5cf6]" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{pendingUsers} Pending Users</p>
                      <p className="text-sm text-[#6b7280]">Awaiting approval</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#10b981] group-hover:translate-x-1 transition-transform">
                    <span className="text-sm font-medium">Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            )}
            
            {pendingWithdrawals.length > 0 && (
              <Link href="/admin/withdrawals">
                <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl hover:bg-[#0f1419]/80 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f59e0b]/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-[#f59e0b]" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{pendingWithdrawals.length} Withdrawal Requests</p>
                      <p className="text-sm text-[#6b7280]">Needs processing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#10b981] group-hover:translate-x-1 transition-transform">
                    <span className="text-sm font-medium">Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            )}

            {pendingUsers === 0 && pendingWithdrawals.length === 0 && (
              <div className="flex items-center justify-center p-8 text-center">
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#10b981]/20 flex items-center justify-center mx-auto mb-3">
                    <UserCheck className="w-6 h-6 text-[#10b981]" />
                  </div>
                  <p className="font-medium text-white">All Clear!</p>
                  <p className="text-sm text-[#6b7280]">No pending approvals required.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[#2a3a4d]">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-[#8b5cf6]" />
              <h2 className="text-lg font-semibold text-white">Recent Users</h2>
            </div>
            <Link href="/admin/users">
              <span className="text-sm text-[#10b981] hover:underline cursor-pointer">View all</span>
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-[#0f1419] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center text-white font-bold">
                      {user.fullName?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.fullName || user.username}</p>
                      <p className="text-sm text-[#6b7280]">@{user.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' 
                        ? 'bg-[#10b981]/20 text-[#10b981]' 
                        : user.status === 'pending'
                        ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                        : 'bg-[#ef4444]/20 text-[#ef4444]'
                    }`}>
                      {user.status}
                    </span>
                    <p className="text-sm text-[#10b981] mt-1">{formatCurrency(user.balance || 0)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center p-8 text-center">
                <div>
                  <AlertCircle className="w-8 h-8 text-[#6b7280] mx-auto mb-2" />
                  <p className="text-[#6b7280]">No users yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
