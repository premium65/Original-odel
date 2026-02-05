import { useState } from "react";
import { Crown, Search, RotateCcw, Star, Wallet, UserCog, Loader2, X, Eye, EyeOff, Phone, Lock, Building2, Gift, DollarSign, Target, Award, Snowflake, Trash2, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Modal wrapper component
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6 w-full max-w-md mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-[#6b7280] hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminPremiumManage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Modal states for all 10 options
  const [eVoucherModal, setEVoucherModal] = useState(false);
  const [eBonusModal, setEBonusModal] = useState(false);
  const [addMoneyModal, setAddMoneyModal] = useState(false);
  const [setAdsModal, setSetAdsModal] = useState(false);
  const [rewardsModal, setRewardsModal] = useState(false);
  const [bankModal, setBankModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addValueModal, setAddValueModal] = useState(false); // New: Add Value modal
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [eVoucherForm, setEVoucherForm] = useState({
    milestoneAdsCount: "",
    milestoneAmount: "",
    milestoneReward: "",
    ongoingMilestone: "",
    bannerUrl: ""
  });
  const [eBonusForm, setEBonusForm] = useState({ bonusAdsCount: "", bonusAmount: "", bannerUrl: "" });
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [setAdsCount, setSetAdsCount] = useState("");
  const [rewardsPoints, setRewardsPoints] = useState("");
  const [addValueForm, setAddValueForm] = useState({ field: "milestoneAmount", amount: "" }); // New: Add Value form
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    branchName: ""
  });
  const [profileForm, setProfileForm] = useState({
    username: "",
    mobileNumber: "",
    password: ""
  });

  // Fetch all users (always load all members)
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin-users-all"],
    queryFn: api.getUsers
  });

  // Fetch selected user details
  const { data: selectedUser, isLoading: isLoadingUser, refetch: refetchUser } = useQuery({
    queryKey: ["admin-user-details", selectedUserId],
    queryFn: () => api.getUser(selectedUserId!),
    enabled: !!selectedUserId
  });

  const filteredUsers = users.filter((u: any) =>
    !searchQuery ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // E-VOUCHER Mutation - Creates milestone hold system
  const eVoucherMutation = useMutation({
    mutationFn: (data: any) => api.createEVoucher(selectedUserId!, {
      milestoneAdsCount: parseInt(data.milestoneAdsCount) || 21,
      milestoneAmount: data.milestoneAmount || "-5000",
      milestoneReward: data.milestoneReward || "2000",
      ongoingMilestone: data.ongoingMilestone || "9000",
      bannerUrl: data.bannerUrl || undefined
    }),
    onSuccess: () => {
      toast({ title: "E-Voucher Created!", description: "Milestone set. Ads will lock when user reaches the target." });
      setEVoucherModal(false);
      setEVoucherForm({ milestoneAdsCount: "", milestoneAmount: "", milestoneReward: "", ongoingMilestone: "", bannerUrl: "" });
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to create E-Voucher", description: error.message, variant: "destructive" });
    }
  });

  // Unlock E-Voucher (after deposit)
  const unlockEVoucherMutation = useMutation({
    mutationFn: () => api.unlockEVoucher(selectedUserId!),
    onSuccess: () => {
      toast({ title: "E-Voucher Unlocked!", description: "User can now continue clicking ads." });
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to unlock", description: error.message, variant: "destructive" });
    }
  });

  // E-BONUS Mutation - Instant reward (NO locking)
  const eBonusMutation = useMutation({
    mutationFn: (data: { bonusAdsCount: string; bonusAmount: string; bannerUrl: string }) =>
      api.createEBonus(selectedUserId!, {
        bonusAdsCount: parseInt(data.bonusAdsCount) || 21,
        bonusAmount: data.bonusAmount || "500",
        bannerUrl: data.bannerUrl || undefined
      }),
    onSuccess: () => {
      toast({ title: "E-Bonus Set!", description: "User will receive instant bonus when they reach the ads count." });
      setEBonusModal(false);
      setEBonusForm({ bonusAdsCount: "", bonusAmount: "", bannerUrl: "" });
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to set E-Bonus", description: error.message, variant: "destructive" });
    }
  });

  // AD RESET Mutation
  const adResetMutation = useMutation({
    mutationFn: () => api.resetUserField(selectedUserId!, "totalAdsCompleted"),
    onSuccess: () => {
      toast({ title: "Ads Reset!", description: "User's ad count is now 0." });
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to reset ads", description: error.message, variant: "destructive" });
    }
  });

  // ADD $ Mutation
  const addMoneyMutation = useMutation({
    mutationFn: (amount: string) => api.addUserValue(selectedUserId!, "balance", amount),
    onSuccess: () => {
      toast({ title: "Money Added!", description: `Added LKR ${addMoneyAmount} to balance.` });
      setAddMoneyModal(false);
      setAddMoneyAmount("");
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to add money", description: error.message, variant: "destructive" });
    }
  });

  // SET ADS Mutation
  const setAdsMutation = useMutation({
    mutationFn: async (count: string) => {
      // First reset to 0, then add the count
      await api.resetUserField(selectedUserId!, "totalAdsCompleted");
      if (parseInt(count) > 0) {
        await api.addUserValue(selectedUserId!, "totalAdsCompleted", count);
      }
      return count;
    },
    onSuccess: (count) => {
      toast({ title: "Ads Set!", description: `User now has ${count} ads completed.` });
      setSetAdsModal(false);
      setSetAdsCount("");
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to set ads", description: error.message, variant: "destructive" });
    }
  });

  // REWARDS Mutation
  const rewardsMutation = useMutation({
    mutationFn: async (points: string) => {
      // Reset points first then add new value
      await api.resetUserField(selectedUserId!, "points");
      if (parseInt(points) > 0) {
        await api.addUserValue(selectedUserId!, "points", points);
      }
      return points;
    },
    onSuccess: (points) => {
      toast({ title: "Rewards Updated!", description: `User now has ${points} points.` });
      setRewardsModal(false);
      setRewardsPoints("");
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update rewards", description: error.message, variant: "destructive" });
    }
  });

  // BANK Mutation
  const bankMutation = useMutation({
    mutationFn: (data: any) => api.updateBankDetails(selectedUserId!, data),
    onSuccess: () => {
      toast({ title: "Bank Details Updated!" });
      setBankModal(false);
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update bank details", description: error.message, variant: "destructive" });
    }
  });

  // PROFILE Mutation
  const profileMutation = useMutation({
    mutationFn: (data: any) => api.updateUserDetails(selectedUserId!, data),
    onSuccess: () => {
      toast({ title: "Profile Updated!" });
      setProfileModal(false);
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update profile", description: error.message, variant: "destructive" });
    }
  });

  // FREEZE/UNFREEZE Mutation
  const freezeMutation = useMutation({
    mutationFn: () => api.updateUserDetails(selectedUserId!, {
      status: selectedUser?.status === "frozen" ? "active" : "frozen"
    }),
    onSuccess: () => {
      const newStatus = selectedUser?.status === "frozen" ? "active" : "frozen";
      toast({ title: newStatus === "frozen" ? "Account Frozen!" : "Account Unfrozen!" });
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    }
  });

  // DELETE Mutation
  const deleteMutation = useMutation({
    mutationFn: () => api.deleteUser(selectedUserId!),
    onSuccess: () => {
      toast({ title: "User Deleted!", description: "Account permanently removed." });
      setDeleteModal(false);
      setSelectedUserId(null);
      setSearchQuery("");
      queryClient.invalidateQueries({ queryKey: ["admin-users-search"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete user", description: error.message, variant: "destructive" });
    }
  });

  // ADD VALUE Mutation (for milestoneAmount, ongoingMilestone, milestoneReward)
  const addValueMutation = useMutation({
    mutationFn: ({ field, amount }: { field: string; amount: string }) => 
      api.addUserValue(selectedUserId!, field, amount),
    onSuccess: () => {
      toast({ title: "Value Added!", description: "Field updated successfully." });
      setAddValueModal(false);
      setAddValueForm({ field: "milestoneAmount", amount: "" });
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to add value", description: error.message, variant: "destructive" });
    }
  });

  // RESET FIELD Mutation
  const resetFieldMutation = useMutation({
    mutationFn: (field: string) => api.resetUserField(selectedUserId!, field),
    onSuccess: () => {
      toast({ title: "Field Reset!", description: "Field set to 0 successfully." });
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to reset field", description: error.message, variant: "destructive" });
    }
  });

  // Open modals with current data
  const openBankModal = () => {
    if (selectedUser) {
      setBankForm({
        bankName: selectedUser.bankName || "",
        accountNumber: selectedUser.accountNumber || "",
        accountHolderName: selectedUser.accountHolderName || "",
        branchName: selectedUser.branchName || ""
      });
      setBankModal(true);
    }
  };

  const openProfileModal = () => {
    if (selectedUser) {
      setProfileForm({
        username: selectedUser.username || "",
        mobileNumber: selectedUser.mobileNumber || "",
        password: ""
      });
      setProfileModal(true);
    }
  };

  // User stats display
  const userStats = selectedUser ? [
    { label: "Balance", value: `LKR ${parseFloat(selectedUser.balance || 0).toLocaleString()}`, color: "#3b82f6" },
    { label: "Milestone Amount", value: `LKR ${parseFloat(selectedUser.milestoneAmount || 0).toLocaleString()}`, color: parseFloat(selectedUser.milestoneAmount || 0) < 0 ? "#ef4444" : "#10b981" },
    { label: "Ongoing Milestone", value: `LKR ${parseFloat(selectedUser.ongoingMilestone || 0).toLocaleString()}`, color: "#f59e0b" },
    { label: "Milestone Reward", value: `LKR ${parseFloat(selectedUser.milestoneReward || 0).toLocaleString()}`, color: "#8b5cf6" },
    { label: "Ads Completed", value: selectedUser.totalAdsCompleted || 0, color: "#06b6d4" },
    { label: "Points", value: `${selectedUser.points || 0}/100`, color: "#14b8a6" },
  ] : [];

  // 11 Action buttons configuration (added ADD VALUE)
  const actionButtons = [
    { id: "evoucher", label: "E-VOUCHER", icon: Gift, color: "#f59e0b", desc: "Milestone + Lock", onClick: () => setEVoucherModal(true) },
    { id: "adreset", label: "AD RESET", icon: RotateCcw, color: "#ef4444", desc: "Reset to 0", onClick: () => adResetMutation.mutate() },
    { id: "ebonus", label: "E-BONUS", icon: Star, color: "#10b981", desc: "Instant bonus", onClick: () => setEBonusModal(true) },
    { id: "addmoney", label: "ADD $", icon: DollarSign, color: "#3b82f6", desc: "Add balance", onClick: () => setAddMoneyModal(true) },
    { id: "addvalue", label: "ADD VALUE", icon: Wallet, color: "#f97316", desc: "Set milestone fields", onClick: () => setAddValueModal(true) },
    { id: "ads", label: "AD'S", icon: Target, color: "#06b6d4", desc: "Set ads count", onClick: () => setSetAdsModal(true) },
    { id: "rewards", label: "REWARDS", icon: Award, color: "#8b5cf6", desc: "Points 0-100", onClick: () => setRewardsModal(true) },
    { id: "bank", label: "BANK", icon: Building2, color: "#14b8a6", desc: "Bank details", onClick: openBankModal },
    { id: "profile", label: "PROFILE", icon: UserCog, color: "#ec4899", desc: "User info", onClick: openProfileModal },
    { id: "freeze", label: selectedUser?.status === "frozen" ? "UNFREEZE" : "FREEZE", icon: Snowflake, color: selectedUser?.status === "frozen" ? "#10b981" : "#64748b", desc: selectedUser?.status === "frozen" ? "Activate" : "Suspend", onClick: () => freezeMutation.mutate() },
    { id: "delete", label: "DELETE", icon: Trash2, color: "#dc2626", desc: "Remove user", onClick: () => setDeleteModal(true) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#f59e0b] flex items-center justify-center"><Crown className="h-6 w-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Premium Manage</h1><p className="text-[#9ca3af]">Complete user management with 11 options</p></div>
      </div>

      <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4d]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">All Registered Members</h3>
          <span className="text-sm text-[#9ca3af]">{users.length} users</span>
        </div>
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
        </div>

        {/* All Users List */}
        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#f59e0b]" />
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto rounded-xl border border-[#2a3a4d] divide-y divide-[#2a3a4d]">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-[#6b7280]">No users found</div>
            ) : (
              filteredUsers.map((user: any) => (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setSearchQuery("");
                  }}
                  className={`flex items-center justify-between p-4 cursor-pointer transition-all ${
                    selectedUserId === user.id
                      ? "bg-[#f59e0b]/20 border-l-4 border-l-[#f59e0b]"
                      : "hover:bg-[#0f1419]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-full flex items-center justify-center text-white font-semibold uppercase">
                      {user.username?.[0] || "U"}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-[#6b7280] text-sm">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === "active" ? "bg-[#10b981]/20 text-[#10b981]" :
                      user.status === "frozen" ? "bg-[#ef4444]/20 text-[#ef4444]" :
                      "bg-[#f59e0b]/20 text-[#f59e0b]"
                    }`}>{user.status}</span>
                    <span className="text-[#10b981] font-semibold text-sm">LKR {Number(user.balance || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {isLoadingUser && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#f59e0b]" />
          </div>
        )}

        {selectedUser && !isLoadingUser ? (
          <>
            {/* User Info Header */}
            <div className="flex items-center gap-4 p-5 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl mb-6 relative">
              <button
                onClick={() => { setSelectedUserId(null); setSearchQuery(""); }}
                className="absolute top-4 right-4 text-[#9ca3af] hover:text-white text-sm"
              >
                Change User
              </button>
              <div className="w-14 h-14 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-full flex items-center justify-center text-2xl font-bold text-white uppercase">
                {selectedUser.username?.charAt(0) || "U"}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white">{selectedUser.username}</h4>
                <p className="text-[#9ca3af] text-sm">{selectedUser.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    selectedUser.status === "active" ? "bg-[#10b981]/20 text-[#10b981]" :
                    selectedUser.status === "frozen" ? "bg-[#ef4444]/20 text-[#ef4444]" :
                    "bg-[#f59e0b]/20 text-[#f59e0b]"
                  }`}>
                    <CheckCircle className="h-3 w-3" /> {selectedUser.status}
                  </span>
                  {selectedUser.mobileNumber && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#6b7280]/20 text-[#9ca3af] rounded-full text-xs font-medium">
                      <Phone className="h-3 w-3" /> {selectedUser.mobileNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {userStats.map((stat) => (
                <div key={stat.label} className="bg-[#0f1419] border border-[#2a3a4d] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#6b7280] mb-1">{stat.label}</p>
                  <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* 10 Action Buttons Grid */}
            <h4 className="text-white font-semibold mb-4">Quick Actions (10 Options)</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {actionButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={btn.onClick}
                  disabled={adResetMutation.isPending || freezeMutation.isPending}
                  className="bg-[#0f1419] border border-[#2a3a4d] rounded-xl p-4 text-center cursor-pointer hover:border-opacity-100 transition-all group disabled:opacity-50"
                  style={{ borderColor: `${btn.color}30` }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = btn.color)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${btn.color}30`)}
                >
                  <btn.icon className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ color: btn.color }} />
                  <h4 className="text-white font-medium text-sm">{btn.label}</h4>
                  <p className="text-[#6b7280] text-xs">{btn.desc}</p>
                </button>
              ))}
            </div>

            {/* Bank Info Display */}
            <h4 className="text-white font-semibold mt-6 mb-4">Bank Information</h4>
            <div className="bg-[#0f1419] border border-[#2a3a4d] rounded-xl p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-[#6b7280]">Bank Name</p>
                  <p className="text-white font-medium">{selectedUser.bankName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">Account Number</p>
                  <p className="text-white font-medium">{selectedUser.accountNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">Account Holder</p>
                  <p className="text-white font-medium">{selectedUser.accountHolderName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">Branch</p>
                  <p className="text-white font-medium">{selectedUser.branchName || "-"}</p>
                </div>
              </div>
            </div>
          </>
        ) : !isLoadingUser && (
          <div className="text-center py-12 text-[#9ca3af]">
            <Crown className="h-12 w-12 mx-auto mb-4 text-[#f59e0b]/30" />
            <p>Search and select a user to manage</p>
          </div>
        )}
      </div>

      {/* E-VOUCHER Modal - Milestone Hold System */}
      <Modal isOpen={eVoucherModal} onClose={() => setEVoucherModal(false)} title="Create E-VOUCHER (Milestone Hold)">
        <div className="space-y-4">
          <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg p-3 text-sm text-[#f59e0b]">
            When user reaches the milestone ads count, ads will lock. User must deposit to continue. After deposit, only the hold clears - ads continue from same count.
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Milestone Ads Count (Trigger Point)</label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#f59e0b]"
              value={eVoucherForm.milestoneAdsCount}
              onChange={(e) => setEVoucherForm({ ...eVoucherForm, milestoneAdsCount: e.target.value })}
              placeholder="e.g. 21 (when to lock ads)"
            />
            <p className="text-xs text-[#6b7280] mt-1">Current ads: {selectedUser?.totalAdsCompleted || 0}</p>
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Milestone Amount (Negative = Deposit Required)</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#f59e0b]"
              value={eVoucherForm.milestoneAmount}
              onChange={(e) => setEVoucherForm({ ...eVoucherForm, milestoneAmount: e.target.value })}
              placeholder="e.g. -5000 (deposit to unlock)"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Milestone Reward (Bonus given at milestone)</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#f59e0b]"
              value={eVoucherForm.milestoneReward}
              onChange={(e) => setEVoucherForm({ ...eVoucherForm, milestoneReward: e.target.value })}
              placeholder="e.g. 2000 (bonus)"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Ongoing Milestone (Pending amount)</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#f59e0b]"
              value={eVoucherForm.ongoingMilestone}
              onChange={(e) => setEVoucherForm({ ...eVoucherForm, ongoingMilestone: e.target.value })}
              placeholder="e.g. 9000 (pending)"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Banner Image URL (Optional)</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#f59e0b]"
              value={eVoucherForm.bannerUrl}
              onChange={(e) => setEVoucherForm({ ...eVoucherForm, bannerUrl: e.target.value })}
              placeholder="https://example.com/banner.jpg"
            />
            <p className="text-xs text-[#6b7280] mt-1">Image shown in popup when milestone is reached</p>
          </div>
          <button
            onClick={() => eVoucherMutation.mutate(eVoucherForm)}
            disabled={eVoucherMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {eVoucherMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create E-Voucher
          </button>

          {/* Show unlock button if ads are locked */}
          {selectedUser?.adsLocked && (
            <div className="mt-4 pt-4 border-t border-[#2a3a4d]">
              <p className="text-sm text-[#ef4444] mb-3">User's ads are currently locked!</p>
              <button
                onClick={() => unlockEVoucherMutation.mutate()}
                disabled={unlockEVoucherMutation.isPending}
                className="w-full py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {unlockEVoucherMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Unlock (After Deposit)
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* E-BONUS Modal - Instant Reward (NO locking) */}
      <Modal isOpen={eBonusModal} onClose={() => setEBonusModal(false)} title="Set E-BONUS (Instant Reward)">
        <div className="space-y-4">
          <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg p-3 text-sm text-[#10b981]">
            When user reaches the specified ads count, they receive an instant bonus added to their wallet. NO locking, NO deposit required - just a reward!
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Trigger at Ads Count</label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]"
              value={eBonusForm.bonusAdsCount}
              onChange={(e) => setEBonusForm({ ...eBonusForm, bonusAdsCount: e.target.value })}
              placeholder="e.g. 21 (when to give bonus)"
            />
            <p className="text-xs text-[#6b7280] mt-1">Current ads: {selectedUser?.totalAdsCompleted || 0}</p>
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Bonus Amount (LKR)</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]"
              value={eBonusForm.bonusAmount}
              onChange={(e) => setEBonusForm({ ...eBonusForm, bonusAmount: e.target.value })}
              placeholder="e.g. 500"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Banner Image URL (Optional)</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]"
              value={eBonusForm.bannerUrl}
              onChange={(e) => setEBonusForm({ ...eBonusForm, bannerUrl: e.target.value })}
              placeholder="https://example.com/banner.jpg"
            />
            <p className="text-xs text-[#6b7280] mt-1">Image shown in popup when bonus is given</p>
          </div>
          <button
            onClick={() => eBonusMutation.mutate(eBonusForm)}
            disabled={eBonusMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {eBonusMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Set E-Bonus
          </button>
        </div>
      </Modal>

      {/* ADD $ Modal */}
      <Modal isOpen={addMoneyModal} onClose={() => setAddMoneyModal(false)} title="Add Money to Balance">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Amount (LKR) - Use negative to subtract</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#3b82f6]"
              value={addMoneyAmount}
              onChange={(e) => setAddMoneyAmount(e.target.value)}
              placeholder="e.g. 1000 or -500"
            />
          </div>
          <p className="text-xs text-[#6b7280]">Current Balance: LKR {parseFloat(selectedUser?.balance || 0).toLocaleString()}</p>
          <button
            onClick={() => addMoneyMutation.mutate(addMoneyAmount)}
            disabled={addMoneyMutation.isPending || !addMoneyAmount}
            className="w-full py-3 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {addMoneyMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Add to Balance
          </button>
        </div>
      </Modal>

      {/* SET ADS Modal */}
      <Modal isOpen={setAdsModal} onClose={() => setSetAdsModal(false)} title="Set Ads Count">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Set Ads Completed To</label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#06b6d4]"
              value={setAdsCount}
              onChange={(e) => setSetAdsCount(e.target.value)}
              placeholder="e.g. 15"
              min="0"
            />
          </div>
          <p className="text-xs text-[#6b7280]">Current Ads: {selectedUser?.totalAdsCompleted || 0}</p>
          <button
            onClick={() => setAdsMutation.mutate(setAdsCount)}
            disabled={setAdsMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {setAdsMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Set Ads Count
          </button>
        </div>
      </Modal>

      {/* REWARDS Modal */}
      <Modal isOpen={rewardsModal} onClose={() => setRewardsModal(false)} title="Set Reward Points">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Points (0-100)</label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#8b5cf6]"
              value={rewardsPoints}
              onChange={(e) => setRewardsPoints(e.target.value)}
              placeholder="e.g. 50"
              min="0"
              max="100"
            />
          </div>
          <p className="text-xs text-[#6b7280]">Current Points: {selectedUser?.points || 0}/100</p>
          <button
            onClick={() => rewardsMutation.mutate(rewardsPoints)}
            disabled={rewardsMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {rewardsMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Set Points
          </button>
        </div>
      </Modal>

      {/* BANK Modal */}
      <Modal isOpen={bankModal} onClose={() => setBankModal(false)} title="Edit Bank Details">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Bank Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#14b8a6]"
              value={bankForm.bankName}
              onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
              placeholder="e.g. Commercial Bank"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Account Number</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#14b8a6]"
              value={bankForm.accountNumber}
              onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
              placeholder="e.g. 1234567890"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Account Holder Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#14b8a6]"
              value={bankForm.accountHolderName}
              onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Branch Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#14b8a6]"
              value={bankForm.branchName}
              onChange={(e) => setBankForm({ ...bankForm, branchName: e.target.value })}
              placeholder="e.g. Colombo Main"
            />
          </div>
          <button
            onClick={() => bankMutation.mutate(bankForm)}
            disabled={bankMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {bankMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Bank Details
          </button>
        </div>
      </Modal>

      {/* PROFILE Modal */}
      <Modal isOpen={profileModal} onClose={() => setProfileModal(false)} title="Edit Profile">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#ec4899]"
              value={profileForm.username}
              onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">
              <Phone className="h-3 w-3 inline mr-1" /> Mobile Number
            </label>
            <input
              type="tel"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#ec4899]"
              value={profileForm.mobileNumber}
              onChange={(e) => setProfileForm({ ...profileForm, mobileNumber: e.target.value })}
              placeholder="e.g. 0771234567"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">
              <Lock className="h-3 w-3 inline mr-1" /> New Password (leave empty to keep)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#ec4899] pr-12"
                value={profileForm.password}
                onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              const data: any = { username: profileForm.username, mobileNumber: profileForm.mobileNumber };
              if (profileForm.password) data.password = profileForm.password;
              profileMutation.mutate(data);
            }}
            disabled={profileMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-[#ec4899] to-[#db2777] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {profileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Profile
          </button>
        </div>
      </Modal>

      {/* ADD VALUE Modal - For setting milestone fields */}
      <Modal isOpen={addValueModal} onClose={() => setAddValueModal(false)} title="Add Value to Milestone Fields">
        <div className="space-y-4">
          <div className="bg-[#f97316]/10 border border-[#f97316]/30 rounded-lg p-3 text-sm text-[#f97316]">
            <p className="font-semibold mb-2">Field Meanings:</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Milestone Amount</strong>: Main balance (can be negative). Customer must earn to positive before withdrawal.</li>
              <li>• <strong>Ongoing Milestone</strong>: Pending/locked amount (display only, motivational).</li>
              <li>• <strong>Milestone Reward</strong>: Commission per ad click.</li>
            </ul>
          </div>
          
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Select Field</label>
            <select
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#f97316]"
              value={addValueForm.field}
              onChange={(e) => setAddValueForm({ ...addValueForm, field: e.target.value })}
            >
              <option value="milestoneAmount">Milestone Amount (Main Balance)</option>
              <option value="ongoingMilestone">Ongoing Milestone (Pending/Locked)</option>
              <option value="milestoneReward">Milestone Reward (Commission)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Amount (can be negative for Milestone Amount)</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#f97316]"
              value={addValueForm.amount}
              onChange={(e) => setAddValueForm({ ...addValueForm, amount: e.target.value })}
              placeholder="e.g. -5000 or 10000"
            />
            <p className="text-xs text-[#6b7280] mt-1">
              {addValueForm.field === "milestoneAmount" && `Current: LKR ${parseFloat(selectedUser?.milestoneAmount || 0).toLocaleString()}`}
              {addValueForm.field === "ongoingMilestone" && `Current: LKR ${parseFloat(selectedUser?.ongoingMilestone || 0).toLocaleString()}`}
              {addValueForm.field === "milestoneReward" && `Current: LKR ${parseFloat(selectedUser?.milestoneReward || 0).toLocaleString()}`}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => resetFieldMutation.mutate(addValueForm.field)}
              disabled={resetFieldMutation.isPending}
              className="flex-1 py-3 bg-[#ef4444] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[#dc2626]"
            >
              {resetFieldMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Reset to 0
            </button>
            <button
              onClick={() => addValueMutation.mutate(addValueForm)}
              disabled={addValueMutation.isPending || !addValueForm.amount}
              className="flex-1 py-3 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addValueMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Value
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE Confirmation Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete User">
        <div className="space-y-4">
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-4 text-center">
            <Trash2 className="h-12 w-12 mx-auto mb-3 text-[#ef4444]" />
            <p className="text-white font-semibold mb-2">Are you sure?</p>
            <p className="text-[#9ca3af] text-sm">
              This will permanently delete <span className="text-white font-medium">{selectedUser?.username}</span> and all their data.
            </p>
          </div>
          <p className="text-[#ef4444] text-sm text-center">This action cannot be undone!</p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal(false)}
              className="flex-1 py-3 bg-[#2a3a4d] text-white font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="flex-1 py-3 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
