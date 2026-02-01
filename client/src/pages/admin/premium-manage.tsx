import { useState } from "react";
import { Crown, Search, CheckCircle, RotateCcw, Star, Gem, Wallet, UserCog, AlertCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function AdminPremiumManage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Fetch users for search
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users-search", searchQuery],
    queryFn: api.getUsers,
    enabled: searchQuery.length > 0
  });

  // Fetch selected user details
  const { data: selectedUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ["admin-user-details", selectedUserId],
    queryFn: () => api.getUser(selectedUserId!),
    enabled: !!selectedUserId
  });

  const filteredUsers = users.filter((u: any) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const milestoneStats = selectedUser ? [
    { label: "Points", value: `${selectedUser.points || 0}/100`, color: "#3b82f6" },
    { label: "Milestone Amount", value: parseFloat(selectedUser.milestoneAmount || 0).toFixed(2), color: "#ef4444", sub: "Deposit" },
    { label: "Milestone Reward", value: parseFloat(selectedUser.milestoneReward || 0).toFixed(2), color: "#10b981", sub: "Premium" },
    { label: "Destination", value: parseFloat(selectedUser.destinationAmount || 0).toFixed(2), color: "#3b82f6", sub: "Normal" },
  ] : [];

  const promotionStats = selectedUser ? [
    { label: "Ads Progress", value: `${selectedUser.restrictedAdsCompleted || 0}/${selectedUser.restrictionAdsLimit || 0}`, color: "#10b981" },
    { label: "Deposit", value: parseFloat(selectedUser.restrictionDeposit || 0).toFixed(2), color: "#ef4444" },
    { label: "Pending", value: parseFloat(selectedUser.ongoingMilestone || 0).toFixed(2), color: "#f59e0b" },
    { label: "Commission/Ad", value: parseFloat(selectedUser.restrictionCommission || 0).toFixed(2), color: "#10b981" },
  ] : [];

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
        <div className="relative mb-5">
          <div className="flex items-center gap-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl px-4 py-3">
            <Search className="h-5 w-5 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Search by username or email..."
              className="bg-transparent border-none outline-none text-white w-full placeholder:text-[#6b7280]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && filteredUsers.length > 0 && !selectedUser && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a2332] border border-[#2a3a4d] rounded-xl overflow-hidden z-10 shadow-lg">
              {filteredUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="px-4 py-3 hover:bg-[#2a3a4d] cursor-pointer flex justify-between items-center text-white"
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setSearchQuery("");
                  }}
                >
                  <span>{user.username}</span>
                  <span className="text-[#9ca3af] text-sm">{user.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedUser ? (
          <>
            <div className="flex items-center gap-4 p-5 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl mb-6 relative">
              <button
                onClick={() => { setSelectedUserId(null); setSearchQuery(""); }}
                className="absolute top-4 right-4 text-[#9ca3af] hover:text-white"
              >
                Change
              </button>
              <div className="w-14 h-14 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-full flex items-center justify-center text-2xl font-bold text-white uppercase">{selectedUser.username.charAt(0)}</div>
              <div>
                <h4 className="text-lg font-semibold text-white">{selectedUser.username}</h4>
                <p className="text-[#9ca3af] text-sm">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#10b981]/20 text-[#10b981] rounded-full text-xs font-medium"><CheckCircle className="h-3 w-3" /> {selectedUser.status}</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3b82f6]/20 text-[#3b82f6] rounded-full text-xs font-medium">LKR {parseFloat(selectedUser.balance || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <h4 className="text-white font-semibold mb-4">Milestone Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {milestoneStats.map((stat) => (
                <div key={stat.label} className="bg-[#0f1419] border border-[#2a3a4d] rounded-xl p-5 text-center">
                  <p className="text-xs text-[#6b7280] mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  {stat.sub && <p className="text-[10px] text-[#6b7280] mt-1">{stat.sub}</p>}
                </div>
              ))}
            </div>

            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-[#f59e0b]" />
                <span className="text-[#f59e0b] font-semibold">Active Promotion</span>
                {(selectedUser.restrictionAdsLimit === null || selectedUser.restrictionAdsLimit === 0) && (
                  <span className="ml-auto text-xs text-[#f59e0b]/70">No active promotion</span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {promotionStats.map((stat) => (
                  <div key={stat.label} className="bg-[#1a2332] border border-[#2a3a4d] rounded-xl p-4 text-center">
                    <p className="text-xs text-[#6b7280] mb-2">{stat.label}</p>
                    <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <h4 className="text-white font-semibold mb-4">Quick Actions</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {actions.map((action) => (
                <button key={action.label} className="bg-[#0f1419] border border-[#2a3a4d] rounded-xl p-6 text-center cursor-pointer hover:border-[#10b981] hover:-translate-y-1 transition-all group">
                  <action.icon className="h-8 w-8 mx-auto mb-3 transition-transform group-hover:scale-110" style={{ color: action.color }} />
                  <h4 className="text-white font-medium text-sm mb-1">{action.label}</h4>
                  <p className="text-[#6b7280] text-xs">{action.desc}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-[#9ca3af]">
            <p>Search and select a user to view premium details</p>
          </div>
        )}
      </div>
    </div>
  );
}
