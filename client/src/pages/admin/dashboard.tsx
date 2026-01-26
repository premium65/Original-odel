import { useQuery } from '@tanstack/react-query';
import { 
  Users, Eye, DollarSign, Wallet, UserCheck, Clock, Zap,
  ArrowUpRight, UserPlus, Crown, Target, AlertCircle, ChevronRight
} from 'lucide-react';
import { Link } from 'wouter';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  totalAdsViewed: number;
  totalCommission: number;
  totalWithdraw: number;
  pendingWithdraw: number;
  totalDeposit: number;
  activeMilestones: number;
  premiumUsers: number;
  pendingWithdrawals: number;
}

interface RecentUser {
  _id: string;
  username: string;
  email: string;
  status: string;
  balance: number;
  createdAt: string;
}

export default function AdminDashboard() {
  // Fetch dashboard stats
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard/stats'],
  });

  // Fetch recent users
  const { data: recentUsers = [] } = useQuery<RecentUser[]>({
    queryKey: ['/api/admin/users/recent'],
  });

  // Default stats if not loaded
  const dashboardStats = stats || {
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    totalAdsViewed: 0,
    totalCommission: 0,
    totalWithdraw: 0,
    pendingWithdraw: 0,
    totalDeposit: 0,
    activeMilestones: 0,
    premiumUsers: 0,
    pendingWithdrawals: 0
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'from-[#06b6d4] to-[#0891b2]',
      'from-[#f59e0b] to-[#d97706]',
      'from-[#ec4899] to-[#db2777]',
      'from-[#8b5cf6] to-[#7c3aed]'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6 p-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-[#6b7280] mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-right">
          <p className="text-[#6b7280] text-sm">Last updated</p>
          <p className="text-white font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Users - GREEN */}
        <div className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl p-4 text-white relative overflow-hidden shadow-lg hover:scale-105 transition-all cursor-pointer">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
          <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-semibold uppercase tracking-wider opacity-90">Total Users</h4>
          <p className="text-3xl font-bold mt-2">{dashboardStats.totalUsers}</p>
          <p className="text-xs opacity-80 mt-1">{dashboardStats.activeUsers} active, {dashboardStats.pendingUsers} pending</p>
          <div className="flex items-center gap-1 mt-2 text-xs">
            <ArrowUpRight className="w-3 h-3" />
            <span>Platform health</span>
          </div>
        </div>

        {/* Total Ads Viewed - BLUE */}
        <div className="bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-xl p-4 text-white relative overflow-hidden shadow-lg hover:scale-105 transition-all cursor-pointer">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
          <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-semibold uppercase tracking-wider opacity-90">Total Ads Viewed</h4>
          <p className="text-3xl font-bold mt-2">{dashboardStats.totalAdsViewed.toLocaleString()}</p>
          <p className="text-xs opacity-80 mt-1">All time clicks</p>
          <div className="flex items-center gap-1 mt-2 text-xs">
            <ArrowUpRight className="w-3 h-3" />
            <span>8% from last week</span>
          </div>
        </div>

        {/* Total Commission - PURPLE */}
        <div className="bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-xl p-4 text-white relative overflow-hidden shadow-lg hover:scale-105 transition-all cursor-pointer">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
          <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-semibold uppercase tracking-wider opacity-90">Total Commission</h4>
          <p className="text-3xl font-bold mt-2">₹{dashboardStats.totalCommission.toLocaleString()}</p>
          <p className="text-xs opacity-80 mt-1">Earnings distributed</p>
          <div className="flex items-center gap-1 mt-2 text-xs">
            <ArrowUpRight className="w-3 h-3" />
            <span>23% from last week</span>
          </div>
        </div>

        {/* Total Withdraw - ORANGE */}
        <div className="bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-xl p-4 text-white relative overflow-hidden shadow-lg hover:scale-105 transition-all cursor-pointer">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
          <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-semibold uppercase tracking-wider opacity-90">Total Withdraw</h4>
          <p className="text-3xl font-bold mt-2">₹{dashboardStats.totalWithdraw.toLocaleString()}</p>
          <p className="text-xs opacity-80 mt-1">₹{dashboardStats.pendingWithdraw.toLocaleString()} pending</p>
        </div>

        {/* Total Deposit - PINK */}
        <div className="bg-gradient-to-br from-[#ec4899] to-[#db2777] rounded-xl p-4 text-white relative overflow-hidden shadow-lg hover:scale-105 transition-all cursor-pointer">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
          <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-semibold uppercase tracking-wider opacity-90">Total Deposit</h4>
          <p className="text-3xl font-bold mt-2">₹{dashboardStats.totalDeposit.toLocaleString()}</p>
          <p className="text-xs opacity-80 mt-1">User balances</p>
        </div>

        {/* Active Users - TEAL */}
        <div className="bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-xl p-4 text-white relative overflow-hidden shadow-lg hover:scale-105 transition-all cursor-pointer">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
          <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-semibold uppercase tracking-wider opacity-90">Active Users</h4>
          <p className="text-3xl font-bold mt-2">{dashboardStats.activeUsers}</p>
          <p className="text-xs opacity-80 mt-1">{dashboardStats.totalUsers > 0 ? Math.round((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100) : 0}% of total</p>
        </div>
      </div>

      {/* Action & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Priority Actions */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2a3a4d] flex items-center justify-between bg-gradient-to-r from-[#ef4444]/20 to-transparent">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#ef4444]" /> High Priority Actions
            </h3>
            <span className="px-3 py-1 bg-[#ef4444]/20 text-[#ef4444] rounded-full text-xs font-semibold">
              {(dashboardStats.pendingUsers || 0) + (dashboardStats.pendingWithdrawals || 0)} pending
            </span>
          </div>
          <div className="p-4 space-y-3">
            {/* Pending Users */}
            <Link href="/admin/pending">
              <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d] hover:border-[#3a4a5d] transition-all group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#10b981]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all">
                    <UserPlus className="w-6 h-6 text-[#10b981]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{dashboardStats.pendingUsers} Pending Users</h4>
                    <p className="text-[#6b7280] text-sm">Awaiting approval</p>
                  </div>
                </div>
                <span className="text-[#10b981] text-sm font-medium flex items-center gap-1">
                  Review <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Withdrawal Requests */}
            <Link href="/admin/withdrawals">
              <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d] hover:border-[#3a4a5d] transition-all group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#f59e0b]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all">
                    <Wallet className="w-6 h-6 text-[#f59e0b]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{dashboardStats.pendingWithdrawals} Withdrawal Requests</h4>
                    <p className="text-[#6b7280] text-sm">Pending approval</p>
                  </div>
                </div>
                <span className="text-[#f59e0b] text-sm font-medium flex items-center gap-1">
                  Review <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Premium Milestones */}
            <Link href="/admin/premium-manage">
              <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d] hover:border-[#3a4a5d] transition-all group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all">
                    <Target className="w-6 h-6 text-[#8b5cf6]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      {dashboardStats.activeMilestones} Active Milestones
                      <span className="px-1.5 py-0.5 text-[8px] bg-[#ef4444] text-white rounded font-bold">NEW</span>
                    </h4>
                    <p className="text-[#6b7280] text-sm">Premium users in progress</p>
                  </div>
                </div>
                <span className="text-[#8b5cf6] text-sm font-medium flex items-center gap-1">
                  Manage <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2a3a4d] flex items-center justify-between bg-gradient-to-r from-[#3b82f6]/20 to-transparent">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#3b82f6]" /> Recent Users
            </h3>
            <Link href="/admin/users" className="text-[#10b981] text-sm font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="p-4">
            {recentUsers.length === 0 ? (
              <p className="text-center text-[#6b7280] py-8">No recent users</p>
            ) : (
              recentUsers.slice(0, 5).map((user, i) => (
                <div key={user._id} className={`flex items-center justify-between py-4 ${i !== Math.min(recentUsers.length - 1, 4) ? 'border-b border-[#2a3a4d]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(i)} flex items-center justify-center text-white font-bold shadow-lg`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{user.username}</h4>
                      <p className="text-[#6b7280] text-sm">@{user.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                    }`}>
                      {user.status}
                    </span>
                    <p className="text-[#9ca3af] text-sm mt-1">₹{(user.balance || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-4 hover:border-[#10b981]/50 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[#6b7280] text-xs">Active Milestones</p>
              <p className="text-white text-xl font-bold">{dashboardStats.activeMilestones}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-4 hover:border-[#8b5cf6]/50 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[#6b7280] text-xs">Premium Users</p>
              <p className="text-white text-xl font-bold">{dashboardStats.premiumUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-4 hover:border-[#f59e0b]/50 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[#6b7280] text-xs">Pending Withdrawals</p>
              <p className="text-white text-xl font-bold">{dashboardStats.pendingWithdrawals}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-4 hover:border-[#ef4444]/50 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-xl flex items-center justify-center shadow-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[#6b7280] text-xs">Pending Approvals</p>
              <p className="text-white text-xl font-bold">{dashboardStats.pendingUsers}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
