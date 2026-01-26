import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, Eye, DollarSign, Wallet, UserCheck, Clock, 
  ChevronRight, Zap, Target, Crown, AlertCircle, UserPlus, PiggyBank,
  TrendingUp, ArrowUpRight
} from "lucide-react";
import { Link } from "wouter";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  totalAdsViewed: number;
  totalCommission: number;
  totalWithdraw: number;
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
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    }));
  }, []);

  // Fetch dashboard stats - FIXED API PATH
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  // Fetch recent users - FIXED API PATH
  const { data: recentUsers } = useQuery<RecentUser[]>({
    queryKey: ["/api/admin/users/recent"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users/recent", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const kpiCards = [
    { 
      title: "Total Users", 
      value: stats?.totalUsers || 0, 
      subtitle: `${stats?.activeUsers || 0} active, ${stats?.pendingUsers || 0} pending`,
      change: "↗ 12% from last week",
      icon: Users, 
      gradient: "from-[#10b981] to-[#059669]" 
    },
    { 
      title: "Total Ads Viewed", 
      value: (stats?.totalAdsViewed || 0).toLocaleString(), 
      subtitle: "All time clicks",
      change: "↗ 8% from last week",
      icon: Eye, 
      gradient: "from-[#3b82f6] to-[#2563eb]" 
    },
    { 
      title: "Total Commission", 
      value: `₹${(stats?.totalCommission || 0).toLocaleString()}`, 
      subtitle: "Earnings distributed",
      change: "↗ 23% from last week",
      icon: DollarSign, 
      gradient: "from-[#8b5cf6] to-[#7c3aed]" 
    },
    { 
      title: "Total Withdraw", 
      value: `₹${(stats?.totalWithdraw || 0).toLocaleString()}`, 
      subtitle: "₹0.00 pending",
      icon: Wallet, 
      gradient: "from-[#f59e0b] to-[#d97706]" 
    },
    { 
      title: "Total Deposit", 
      value: `₹${(stats?.totalDeposit || 0).toLocaleString()}`, 
      subtitle: "User balances",
      icon: PiggyBank, 
      gradient: "from-[#ec4899] to-[#db2777]" 
    },
    { 
      title: "Active Users", 
      value: stats?.activeUsers || 0, 
      subtitle: `${stats?.totalUsers ? Math.round(((stats?.activeUsers || 0) / stats.totalUsers) * 100) : 0}% of total`,
      icon: UserCheck, 
      gradient: "from-[#06b6d4] to-[#0891b2]" 
    },
  ];

  const quickStats = [
    { label: "Active Milestones", value: stats?.activeMilestones || 0, icon: Target, gradient: "from-[#10b981] to-[#059669]" },
    { label: "Premium Users", value: stats?.premiumUsers || 0, icon: Crown, gradient: "from-[#8b5cf6] to-[#7c3aed]" },
    { label: "Pending Withdrawals", value: stats?.pendingWithdrawals || 0, icon: Clock, gradient: "from-[#f59e0b] to-[#d97706]" },
    { label: "Pending Approvals", value: stats?.pendingUsers || 0, icon: AlertCircle, gradient: "from-[#ef4444] to-[#dc2626]" },
  ];

  const avatarColors = [
    "from-[#06b6d4] to-[#0891b2]",
    "from-[#f59e0b] to-[#d97706]",
    "from-[#ec4899] to-[#db2777]",
    "from-[#8b5cf6] to-[#7c3aed]",
    "from-[#10b981] to-[#059669]",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-[#6b7280] mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-right">
          <p className="text-[#6b7280] text-sm">Last updated</p>
          <p className="text-white font-semibold">{currentDate}</p>
        </div>
      </div>

      {/* KPI Section Title */}
      <div className="bg-[#1a2332] border border-[#2a3a4d] rounded-xl p-4">
        <h3 className="text-[#10b981] font-semibold text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> KEY PERFORMANCE INDICATORS (KPIs)
        </h3>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((card, i) => (
          <div 
            key={i} 
            className={`bg-gradient-to-br ${card.gradient} rounded-xl p-4 text-white relative overflow-hidden shadow-lg hover:scale-105 transition-all cursor-pointer`}
          >
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
            <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <card.icon className="w-5 h-5" />
            </div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider opacity-90">{card.title}</h4>
            <p className="text-2xl font-bold mt-2">{card.value}</p>
            <p className="text-[10px] opacity-80 mt-1">{card.subtitle}</p>
            {card.change && (
              <p className="text-[10px] mt-2 flex items-center gap-1 opacity-90">
                <ArrowUpRight className="w-3 h-3" /> {card.change}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Action & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Priority Actions */}
        <Card className="bg-[#1a2332] border-[#2a3a4d]">
          <CardHeader className="border-b border-[#2a3a4d] bg-gradient-to-r from-[#ef4444]/20 to-transparent">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Clock className="w-5 h-5 text-[#ef4444]" /> High Priority Actions
              </CardTitle>
              <span className="px-3 py-1 bg-[#ef4444]/20 text-[#ef4444] rounded-full text-xs font-semibold">
                {(stats?.pendingUsers || 0) + (stats?.pendingWithdrawals || 0)} pending
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {/* Pending Users */}
            <Link href="/admin/pending">
              <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d] hover:border-[#3a4a5d] transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#10b981]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all">
                    <UserPlus className="w-5 h-5 text-[#10b981]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{stats?.pendingUsers || 0} Pending Users</h4>
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
              <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d] hover:border-[#3a4a5d] transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#f59e0b]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all">
                    <Wallet className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{stats?.pendingWithdrawals || 0} Withdrawal Requests</h4>
                    <p className="text-[#6b7280] text-sm">Pending approval</p>
                  </div>
                </div>
                <span className="text-[#f59e0b] text-sm font-medium flex items-center gap-1">
                  Review <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Active Milestones */}
            <Link href="/admin/premium-manage">
              <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d] hover:border-[#3a4a5d] transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#8b5cf6]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all">
                    <Target className="w-5 h-5 text-[#8b5cf6]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      {stats?.activeMilestones || 0} Active Milestones
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
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="bg-[#1a2332] border-[#2a3a4d]">
          <CardHeader className="border-b border-[#2a3a4d] bg-gradient-to-r from-[#3b82f6]/20 to-transparent">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Zap className="w-5 h-5 text-[#3b82f6]" /> Recent Users
              </CardTitle>
              <Link href="/admin/users">
                <span className="text-[#10b981] text-sm cursor-pointer hover:underline">View all</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {recentUsers && recentUsers.length > 0 ? (
              recentUsers.map((user, i) => (
                <div 
                  key={user._id} 
                  className={`flex items-center justify-between py-4 ${i !== (recentUsers.length - 1) ? 'border-b border-[#2a3a4d]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold shadow-lg`}>
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
                    <p className="text-[#9ca3af] text-sm mt-1">₹{user.balance?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#6b7280] text-center py-4">No recent users</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <div 
            key={i} 
            className="bg-[#1a2332] border border-[#2a3a4d] rounded-xl p-4 hover:border-[#3a4a5d] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[#6b7280] text-xs">{stat.label}</p>
                <p className="text-white text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
