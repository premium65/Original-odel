import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Users, Calendar, DollarSign, ArrowDown, ArrowUp, Eye, Clock, TrendingUp } from "lucide-react";

const statCards = [
  { key: "totalUsers", label: "Total Users", icon: Users, color: "blue" },
  { key: "activeUsers", label: "Active Users", icon: Users, color: "green" },
  { key: "totalDeposits", label: "Total Deposits", icon: ArrowUp, color: "emerald", prefix: "LKR " },
  { key: "totalWithdrawals", label: "Total Withdrawals", icon: ArrowDown, color: "red", prefix: "LKR " },
  { key: "totalCommission", label: "Total Commission", icon: DollarSign, color: "orange", prefix: "LKR " },
  { key: "totalAdViews", label: "Ads Viewed", icon: Eye, color: "cyan" },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-[#3b82f6]/20", text: "text-[#3b82f6]" },
  green: { bg: "bg-[#10b981]/20", text: "text-[#10b981]" },
  emerald: { bg: "bg-[#10b981]/20", text: "text-[#10b981]" },
  red: { bg: "bg-[#ef4444]/20", text: "text-[#ef4444]" },
  orange: { bg: "bg-[#f59e0b]/20", text: "text-[#f59e0b]" },
  cyan: { bg: "bg-[#06b6d4]/20", text: "text-[#06b6d4]" },
};

export default function AdminDashboard() {
  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: api.getStats });
  const { data: recent } = useQuery({ queryKey: ["dashboard-recent"], queryFn: api.getRecent });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#10b981] flex items-center justify-center"><TrendingUp className="h-6 w-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Dashboard</h1><p className="text-[#9ca3af]">Welcome back! Here's what's happening today.</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div key={card.key} className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4d] relative">
            <div className={`absolute top-5 right-5 w-12 h-12 rounded-xl ${colorMap[card.color].bg} flex items-center justify-center`}>
              <card.icon className={`h-6 w-6 ${colorMap[card.color].text}`} />
            </div>
            <p className="text-xs uppercase tracking-wider text-[#6b7280] mb-2">{card.label}</p>
            <p className={`text-3xl font-bold ${colorMap[card.color].text}`}>
              {card.prefix || ""}{stats?.[card.key]?.toLocaleString() || "0"}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4d]">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {recent?.recentTransactions?.slice(0, 5).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-[#0f1419] rounded-lg">
                <div><p className="text-white text-sm">{tx.username}</p><p className="text-[#6b7280] text-xs">{tx.type}</p></div>
                <p className={`font-semibold ${tx.type === "deposit" ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                  {tx.type === "deposit" ? "+" : "-"}LKR {tx.amount}
                </p>
              </div>
            )) || <p className="text-[#6b7280]">No recent transactions</p>}
          </div>
        </div>

        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4d]">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recent?.recentUsers?.map((user: any) => (
              <div key={user.id} className="flex items-center gap-3 p-3 bg-[#0f1419] rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-full flex items-center justify-center text-white font-semibold">{user.username[0].toUpperCase()}</div>
                <div className="flex-1"><p className="text-white text-sm">{user.username}</p><p className="text-[#6b7280] text-xs">{user.email}</p></div>
                <span className={`px-2 py-1 rounded text-xs ${user.status === "active" ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#f59e0b]/20 text-[#f59e0b]"}`}>{user.status}</span>
              </div>
            )) || <p className="text-[#6b7280]">No recent users</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
