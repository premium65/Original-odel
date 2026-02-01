import { useState } from "react";
import { Crown, Search, CheckCircle, RotateCcw, Star, Gem, Wallet, UserCog, AlertCircle } from "lucide-react";

export default function AdminPremiumManage() {
  const [searchQuery, setSearchQuery] = useState("");
  const selectedUser = { name: "Nithin Rathore", email: "nithin@example.com", status: "Active", avatar: "N" };
  const milestoneStats = [
    { label: "Points", value: "75/100", color: "#3b82f6" },
    { label: "Milestone Amount", value: "-5,000.00", color: "#ef4444", sub: "Deposit" },
    { label: "Milestone Reward", value: "2,000.00", color: "#10b981", sub: "Premium" },
    { label: "Destination", value: "500.00", color: "#3b82f6", sub: "Normal" },
  ];
  const promotionStats = [
    { label: "Ads Progress", value: "7/12", color: "#10b981" },
    { label: "Deposit", value: "5,000.00", color: "#ef4444" },
    { label: "Pending", value: "2,000.00", color: "#f59e0b" },
    { label: "Commission/Ad", value: "500.00", color: "#10b981" },
  ];
  const actions = [
    { label: "Create Promotion", desc: "Set milestone", icon: Crown, color: "#f59e0b" },
    { label: "RESET Milestone", desc: "Clear progress", icon: RotateCcw, color: "#ef4444" },
    { label: "SET Points", desc: "Set points", icon: Star, color: "#8b5cf6" },
    { label: "ADD Treasure", desc: "Add treasure", icon: Gem, color: "#10b981" },
    { label: "ADD Booking Value", desc: "Add value", icon: Wallet, color: "#3b82f6" },
    { label: "EDIT User/Bank", desc: "Edit details", icon: UserCog, color: "#06b6d4" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#f59e0b] flex items-center justify-center"><Crown className="h-6 w-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Premium Manage</h1><p className="text-[#9ca3af]">Manage user milestones and promotions</p></div>
      </div>
      <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4d]">
        <h3 className="text-lg font-semibold text-white mb-4">Select User</h3>
        <div className="flex items-center gap-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl px-4 py-3 mb-5">
          <Search className="h-5 w-5 text-[#6b7280]" />
          <input type="text" placeholder="Search by username, name, or email..." className="bg-transparent border-none outline-none text-white w-full placeholder:text-[#6b7280]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-4 p-5 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-full flex items-center justify-center text-2xl font-bold text-white">{selectedUser.avatar}</div>
          <div><h4 className="text-lg font-semibold text-white">{selectedUser.name}</h4><p className="text-[#9ca3af] text-sm">{selectedUser.email}</p><span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-[#10b981]/20 text-[#10b981] rounded-full text-xs font-medium"><CheckCircle className="h-3 w-3" /> {selectedUser.status}</span></div>
        </div>
        <h4 className="text-white font-semibold mb-4">Milestone Status</h4>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {milestoneStats.map((stat) => (<div key={stat.label} className="bg-[#0f1419] border border-[#2a3a4d] rounded-xl p-5 text-center"><p className="text-xs text-[#6b7280] mb-2">{stat.label}</p><p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>{stat.sub && <p className="text-[10px] text-[#6b7280] mt-1">{stat.sub}</p>}</div>))}
        </div>
        <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3"><AlertCircle className="h-5 w-5 text-[#f59e0b]" /><span className="text-[#f59e0b] font-semibold">Active Promotion</span></div>
          <div className="grid grid-cols-4 gap-4">
            {promotionStats.map((stat) => (<div key={stat.label} className="bg-[#1a2332] border border-[#2a3a4d] rounded-xl p-4 text-center"><p className="text-xs text-[#6b7280] mb-2">{stat.label}</p><p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p></div>))}
          </div>
        </div>
        <h4 className="text-white font-semibold mb-4">Quick Actions</h4>
        <div className="grid grid-cols-3 gap-4">
          {actions.map((action) => (<div key={action.label} className="bg-[#0f1419] border border-[#2a3a4d] rounded-xl p-6 text-center cursor-pointer hover:border-[#10b981] hover:-translate-y-1 transition-all"><action.icon className="h-8 w-8 mx-auto mb-3" style={{ color: action.color }} /><h4 className="text-white font-medium text-sm mb-1">{action.label}</h4><p className="text-[#6b7280] text-xs">{action.desc}</p></div>))}
        </div>
      </div>
    </div>
  );
}
