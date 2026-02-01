import { useState } from "react";
import { Crown, Search, CheckCircle, RotateCcw, Star, Gem, Wallet, UserCog, AlertCircle, Loader2, X, Plus, Eye, EyeOff, Phone, Mail, Lock, Building2 } from "lucide-react";
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

// Field mappings for reset/add operations
const FIELD_MAPPINGS = {
  booking: { field: "totalAdsCompleted", label: "Booking (Ads Count)", color: "#3b82f6" },
  points: { field: "points", label: "Points (0-100)", color: "#8b5cf6" },
  premiumTreasure: { field: "milestoneReward", label: "Premium Treasure (Total Earned)", color: "#10b981" },
  normalTreasure: { field: "destinationAmount", label: "Normal Treasure (Bonus)", color: "#f59e0b" },
  bookingValue: { field: "milestoneAmount", label: "Booking Value (Withdrawable)", color: "#ef4444" },
};

export default function AdminPremiumManage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Modal states
  const [promotionModal, setPromotionModal] = useState(false);
  const [resetModal, setResetModal] = useState<{ open: boolean; field: string; label: string }>({ open: false, field: "", label: "" });
  const [addValueModal, setAddValueModal] = useState<{ open: boolean; field: string; label: string; isPoints?: boolean }>({ open: false, field: "", label: "" });
  const [editUserModal, setEditUserModal] = useState(false);
  const [editBankModal, setEditBankModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [promotionForm, setPromotionForm] = useState({ adsLimit: "", deposit: "", commission: "", pendingAmount: "" });
  const [addValueAmount, setAddValueAmount] = useState("");
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    status: "active",
    password: ""
  });
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    branchName: ""
  });

  // Fetch users for search
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users-search", searchQuery],
    queryFn: api.getUsers,
    enabled: searchQuery.length > 0
  });

  // Fetch selected user details
  const { data: selectedUser, isLoading: isLoadingUser, refetch: refetchUser } = useQuery({
    queryKey: ["admin-user-details", selectedUserId],
    queryFn: () => api.getUser(selectedUserId!),
    enabled: !!selectedUserId
  });

  const filteredUsers = users.filter((u: any) =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  // Mutations
  const createPromotionMutation = useMutation({
    mutationFn: (data: { adsLimit: number; deposit: string; commission: string; pendingAmount: string }) =>
      api.createPromotion(selectedUserId!, data),
    onSuccess: () => {
      toast({ title: "Promotion created successfully!" });
      setPromotionModal(false);
      setPromotionForm({ adsLimit: "", deposit: "", commission: "", pendingAmount: "" });
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to create promotion", description: error.message, variant: "destructive" });
    }
  });

  const removePromotionMutation = useMutation({
    mutationFn: () => api.removePromotion(selectedUserId!),
    onSuccess: () => {
      toast({ title: "Promotion removed successfully!" });
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to remove promotion", description: error.message, variant: "destructive" });
    }
  });

  const resetFieldMutation = useMutation({
    mutationFn: (field: string) => api.resetUserField(selectedUserId!, field),
    onSuccess: () => {
      toast({ title: "Field reset successfully!" });
      setResetModal({ open: false, field: "", label: "" });
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to reset field", description: error.message, variant: "destructive" });
    }
  });

  const addValueMutation = useMutation({
    mutationFn: ({ field, amount }: { field: string; amount: string }) => api.addUserValue(selectedUserId!, field, amount),
    onSuccess: () => {
      toast({ title: "Value added successfully!" });
      setAddValueModal({ open: false, field: "", label: "" });
      setAddValueAmount("");
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to add value", description: error.message, variant: "destructive" });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: any) => api.updateUserDetails(selectedUserId!, data),
    onSuccess: () => {
      toast({ title: "User details updated!" });
      setEditUserModal(false);
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update user", description: error.message, variant: "destructive" });
    }
  });

  const updateBankMutation = useMutation({
    mutationFn: (data: any) => api.updateBankDetails(selectedUserId!, data),
    onSuccess: () => {
      toast({ title: "Bank details updated!" });
      setEditBankModal(false);
      refetchUser();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update bank details", description: error.message, variant: "destructive" });
    }
  });

  // Open edit modals with current data
  const openEditUserModal = () => {
    if (selectedUser) {
      setUserForm({
        username: selectedUser.username || "",
        email: selectedUser.email || "",
        firstName: selectedUser.firstName || "",
        lastName: selectedUser.lastName || "",
        mobileNumber: selectedUser.mobileNumber || "",
        status: selectedUser.status || "active",
        password: ""
      });
      setEditUserModal(true);
    }
  };

  const openEditBankModal = () => {
    if (selectedUser) {
      setBankForm({
        bankName: selectedUser.bankName || "",
        accountNumber: selectedUser.accountNumber || "",
        accountHolderName: selectedUser.accountHolderName || "",
        branchName: selectedUser.branchName || ""
      });
      setEditBankModal(true);
    }
  };

  // Stats displays with correct field mappings
  const financialStats = selectedUser ? [
    { label: "Booking (Ads)", value: selectedUser.totalAdsCompleted || 0, color: "#3b82f6", field: "totalAdsCompleted", isNumber: true },
    { label: "Points", value: `${selectedUser.points || 0}/100`, color: "#8b5cf6", field: "points", isNumber: true },
    { label: "Booking Value", value: `LKR ${parseFloat(selectedUser.milestoneAmount || 0).toLocaleString()}`, color: "#ef4444", field: "milestoneAmount", sub: "Withdrawable" },
    { label: "Premium Treasure", value: `LKR ${parseFloat(selectedUser.milestoneReward || 0).toLocaleString()}`, color: "#10b981", field: "milestoneReward", sub: "Total Earned" },
    { label: "Normal Treasure", value: `LKR ${parseFloat(selectedUser.destinationAmount || 0).toLocaleString()}`, color: "#f59e0b", field: "destinationAmount", sub: "Bonus" },
  ] : [];

  const promotionStats = selectedUser ? [
    { label: "Ads Progress", value: `${selectedUser.restrictedAdsCompleted || 0}/${selectedUser.restrictionAdsLimit || 0}`, color: "#10b981" },
    { label: "Deposit", value: `LKR ${parseFloat(selectedUser.restrictionDeposit || 0).toLocaleString()}`, color: "#ef4444" },
    { label: "Pending", value: `LKR ${parseFloat(selectedUser.ongoingMilestone || 0).toLocaleString()}`, color: "#f59e0b" },
    { label: "Commission/Ad", value: `LKR ${parseFloat(selectedUser.restrictionCommission || 0).toLocaleString()}`, color: "#10b981" },
  ] : [];

  const hasActivePromotion = selectedUser && selectedUser.restrictionAdsLimit && selectedUser.restrictionAdsLimit > 0;

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
                className="absolute top-4 right-4 text-[#9ca3af] hover:text-white"
              >
                Change
              </button>
              <div className="w-14 h-14 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-full flex items-center justify-center text-2xl font-bold text-white uppercase">{selectedUser.username?.charAt(0) || "U"}</div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white">{selectedUser.username}</h4>
                <p className="text-[#9ca3af] text-sm">{selectedUser.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    selectedUser.status === "active" ? "bg-[#10b981]/20 text-[#10b981]" :
                    selectedUser.status === "frozen" ? "bg-[#ef4444]/20 text-[#ef4444]" :
                    "bg-[#f59e0b]/20 text-[#f59e0b]"
                  }`}><CheckCircle className="h-3 w-3" /> {selectedUser.status}</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3b82f6]/20 text-[#3b82f6] rounded-full text-xs font-medium">LKR {parseFloat(selectedUser.balance || 0).toLocaleString()}</span>
                  {selectedUser.mobileNumber && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#6b7280]/20 text-[#9ca3af] rounded-full text-xs font-medium">
                      <Phone className="h-3 w-3" /> {selectedUser.mobileNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Stats with Reset/Add buttons */}
            <h4 className="text-white font-semibold mb-4">Financial Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {financialStats.map((stat) => (
                <div key={stat.label} className="bg-[#0f1419] border border-[#2a3a4d] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#6b7280]">{stat.label}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setAddValueModal({
                          open: true,
                          field: stat.field,
                          label: stat.label,
                          isPoints: stat.field === "points"
                        })}
                        className="text-[10px] px-1.5 py-0.5 bg-[#10b981]/20 text-[#10b981] rounded hover:bg-[#10b981]/30"
                        title="Add"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setResetModal({ open: true, field: stat.field, label: stat.label })}
                        className="text-[10px] px-1.5 py-0.5 bg-[#ef4444]/20 text-[#ef4444] rounded hover:bg-[#ef4444]/30"
                        title="Reset"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-center" style={{ color: stat.color }}>{stat.value}</p>
                  {stat.sub && <p className="text-[10px] text-[#6b7280] text-center mt-1">{stat.sub}</p>}
                </div>
              ))}
            </div>

            {/* Promotion Status */}
            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-[#f59e0b]" />
                  <span className="text-[#f59e0b] font-semibold">Promotion Status</span>
                </div>
                <button
                  onClick={() => hasActivePromotion ? removePromotionMutation.mutate() : setPromotionModal(true)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                    hasActivePromotion
                      ? "bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30"
                      : "bg-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/30"
                  }`}
                >
                  {hasActivePromotion ? "Remove Promotion" : "Create Promotion"}
                </button>
              </div>
              {!hasActivePromotion && (
                <p className="text-xs text-[#f59e0b]/70 mb-3">No active promotion</p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {promotionStats.map((stat) => (
                  <div key={stat.label} className="bg-[#1a2332] border border-[#2a3a4d] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#6b7280] mb-1">{stat.label}</p>
                    <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Info Display */}
            <h4 className="text-white font-semibold mb-4">Bank Information</h4>
            <div className="bg-[#0f1419] border border-[#2a3a4d] rounded-xl p-4 mb-6">
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

            {/* Quick Actions */}
            <h4 className="text-white font-semibold mb-4">Quick Actions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={openEditUserModal}
                className="bg-[#0f1419] border border-[#2a3a4d] rounded-xl p-4 text-center cursor-pointer hover:border-[#06b6d4] transition-all group"
              >
                <UserCog className="h-6 w-6 mx-auto mb-2 text-[#06b6d4] group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-medium text-sm">Edit User</h4>
                <p className="text-[#6b7280] text-xs">Name, Email, Status</p>
              </button>
              <button
                onClick={openEditBankModal}
                className="bg-[#0f1419] border border-[#2a3a4d] rounded-xl p-4 text-center cursor-pointer hover:border-[#8b5cf6] transition-all group"
              >
                <Building2 className="h-6 w-6 mx-auto mb-2 text-[#8b5cf6] group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-medium text-sm">Edit Bank</h4>
                <p className="text-[#6b7280] text-xs">Bank Details</p>
              </button>
              <button
                onClick={() => setResetModal({ open: true, field: "totalAdsCompleted", label: "Booking (Ads Count)" })}
                className="bg-[#0f1419] border border-[#2a3a4d] rounded-xl p-4 text-center cursor-pointer hover:border-[#ef4444] transition-all group"
              >
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-[#ef4444] group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-medium text-sm">Reset Booking</h4>
                <p className="text-[#6b7280] text-xs">Clear ad history</p>
              </button>
              <button
                onClick={() => setAddValueModal({ open: true, field: "points", label: "Points", isPoints: true })}
                className="bg-[#0f1419] border border-[#2a3a4d] rounded-xl p-4 text-center cursor-pointer hover:border-[#8b5cf6] transition-all group"
              >
                <Star className="h-6 w-6 mx-auto mb-2 text-[#8b5cf6] group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-medium text-sm">Add Points</h4>
                <p className="text-[#6b7280] text-xs">Up to 100</p>
              </button>
            </div>
          </>
        ) : !isLoadingUser && (
          <div className="text-center py-12 text-[#9ca3af]">
            <p>Search and select a user to view premium details</p>
          </div>
        )}
      </div>

      {/* Create Promotion Modal */}
      <Modal isOpen={promotionModal} onClose={() => setPromotionModal(false)} title="Create Promotion">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Ads Limit (number of ads to complete)</label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#f59e0b]"
              value={promotionForm.adsLimit}
              onChange={(e) => setPromotionForm({ ...promotionForm, adsLimit: e.target.value })}
              placeholder="e.g. 12"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Deposit Requirement (LKR)</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#f59e0b]"
              value={promotionForm.deposit}
              onChange={(e) => setPromotionForm({ ...promotionForm, deposit: e.target.value })}
              placeholder="e.g. 5000"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Commission per Ad (LKR)</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#f59e0b]"
              value={promotionForm.commission}
              onChange={(e) => setPromotionForm({ ...promotionForm, commission: e.target.value })}
              placeholder="e.g. 101.75"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Pending Amount (ongoingMilestone)</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#f59e0b]"
              value={promotionForm.pendingAmount}
              onChange={(e) => setPromotionForm({ ...promotionForm, pendingAmount: e.target.value })}
              placeholder="e.g. 10000"
            />
          </div>
          <button
            onClick={() => createPromotionMutation.mutate({
              adsLimit: parseInt(promotionForm.adsLimit) || 0,
              deposit: promotionForm.deposit,
              commission: promotionForm.commission,
              pendingAmount: promotionForm.pendingAmount
            })}
            disabled={createPromotionMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createPromotionMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Promotion
          </button>
        </div>
      </Modal>

      {/* Reset Field Modal */}
      <Modal isOpen={resetModal.open} onClose={() => setResetModal({ open: false, field: "", label: "" })} title={`Reset ${resetModal.label}`}>
        <div className="space-y-4">
          <p className="text-[#9ca3af]">
            Are you sure you want to reset <span className="text-white font-medium">{resetModal.label}</span> to 0?
          </p>
          <p className="text-[#ef4444] text-sm">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setResetModal({ open: false, field: "", label: "" })}
              className="flex-1 py-3 bg-[#2a3a4d] text-white font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => resetFieldMutation.mutate(resetModal.field)}
              disabled={resetFieldMutation.isPending}
              className="flex-1 py-3 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resetFieldMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Reset
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Value Modal */}
      <Modal isOpen={addValueModal.open} onClose={() => { setAddValueModal({ open: false, field: "", label: "" }); setAddValueAmount(""); }} title={`Add to ${addValueModal.label}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">
              {addValueModal.isPoints ? "Points to Add (max 100 total)" : "Amount to Add (LKR)"}
            </label>
            <input
              type={addValueModal.isPoints ? "number" : "text"}
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]"
              value={addValueAmount}
              onChange={(e) => setAddValueAmount(e.target.value)}
              placeholder={addValueModal.isPoints ? "e.g. 10" : "e.g. 1000"}
              max={addValueModal.isPoints ? 100 : undefined}
            />
            {addValueModal.isPoints && (
              <p className="text-xs text-[#6b7280] mt-1">Current: {selectedUser?.points || 0} points</p>
            )}
          </div>
          <button
            onClick={() => addValueMutation.mutate({ field: addValueModal.field, amount: addValueAmount })}
            disabled={addValueMutation.isPending || !addValueAmount}
            className="w-full py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {addValueMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Value
          </button>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={editUserModal} onClose={() => setEditUserModal(false)} title="Edit User Details">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#9ca3af] mb-1">First Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#06b6d4]"
                value={userForm.firstName}
                onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-[#9ca3af] mb-1">Last Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#06b6d4]"
                value={userForm.lastName}
                onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">
              <Mail className="h-3 w-3 inline mr-1" /> Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#06b6d4]"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">
              <Phone className="h-3 w-3 inline mr-1" /> Mobile Number
            </label>
            <input
              type="tel"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#06b6d4]"
              value={userForm.mobileNumber}
              onChange={(e) => setUserForm({ ...userForm, mobileNumber: e.target.value })}
              placeholder="e.g. 0771234567"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Status</label>
            <select
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#06b6d4]"
              value={userForm.status}
              onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="frozen">Frozen</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">
              <Lock className="h-3 w-3 inline mr-1" /> New Password (leave empty to keep current)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#06b6d4] pr-12"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
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
          <div className="flex gap-3 pt-2">
            <button
              onClick={openEditBankModal}
              className="flex-1 py-3 bg-[#2a3a4d] text-white font-semibold rounded-xl"
            >
              Edit Bank
            </button>
            <button
              onClick={() => {
                const updateData: any = { ...userForm };
                if (!updateData.password) delete updateData.password;
                updateUserMutation.mutate(updateData);
              }}
              disabled={updateUserMutation.isPending}
              className="flex-1 py-3 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updateUserMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save User
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Bank Modal */}
      <Modal isOpen={editBankModal} onClose={() => setEditBankModal(false)} title="Edit Bank Details">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Bank Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#06b6d4]"
              value={bankForm.bankName}
              onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
              placeholder="e.g. Commercial Bank"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Account Number</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#06b6d4]"
              value={bankForm.accountNumber}
              onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
              placeholder="e.g. 1234567890"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Account Holder Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#06b6d4]"
              value={bankForm.accountHolderName}
              onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Branch Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#06b6d4]"
              value={bankForm.branchName}
              onChange={(e) => setBankForm({ ...bankForm, branchName: e.target.value })}
              placeholder="e.g. Colombo Main Branch"
            />
          </div>
          <button
            onClick={() => updateBankMutation.mutate(bankForm)}
            disabled={updateBankMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updateBankMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Bank Details
          </button>
        </div>
      </Modal>
    </div>
  );
}
