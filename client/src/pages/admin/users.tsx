import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Users, Search, Plus, Edit, Trash2, Eye, CheckCircle, X, Phone, Mail, CreditCard, Calendar, Wallet, Target, Award, TrendingUp, Building2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: ""
  });

  const { data: users, isLoading } = useQuery({ queryKey: ["users"], queryFn: api.getUsers });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const createUserMutation = useMutation({
    mutationFn: (data: typeof newUser) => api.createUser({ ...data, role: "user" }),
    onSuccess: () => {
      toast({ title: "User Created!", description: "New user has been added successfully." });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowAddModal(false);
      setNewUser({ username: "", email: "", password: "", fullName: "", phone: "" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create user", description: error.message, variant: "destructive" });
    }
  });

  const filteredUsers = users?.filter((u: any) => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#10b981] flex items-center justify-center"><Users className="h-6 w-6 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-white">All Users</h1><p className="text-[#9ca3af]">Manage all registered users</p></div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-lg flex items-center gap-2"><Plus className="h-4 w-4" /> Add User</button>
      </div>

      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="p-4 border-b border-[#2a3a4d]">
          <div className="flex items-center gap-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg px-4 py-2.5">
            <Search className="h-4 w-4 text-[#6b7280]" />
            <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-white w-full placeholder:text-[#6b7280]" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[#2a3a4d]">
              <th className="text-left p-4 text-xs text-[#9ca3af] uppercase">User</th>
              <th className="text-left p-4 text-xs text-[#9ca3af] uppercase">Email</th>
              <th className="text-left p-4 text-xs text-[#9ca3af] uppercase">Balance</th>
              <th className="text-left p-4 text-xs text-[#9ca3af] uppercase">Status</th>
              <th className="text-left p-4 text-xs text-[#9ca3af] uppercase">Actions</th>
            </tr></thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-[#6b7280]">Loading...</td></tr>
              ) : filteredUsers?.length ? filteredUsers.map((user: any) => (
                <tr key={user.id} className="border-b border-[#2a3a4d] hover:bg-white/5">
                  <td className="p-4"><div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-full flex items-center justify-center text-white font-semibold">{user.username[0].toUpperCase()}</div>
                    <div><p className="text-white font-medium">{user.fullName || user.username}</p><p className="text-[#6b7280] text-sm">@{user.username}</p></div>
                  </div></td>
                  <td className="p-4 text-[#9ca3af]">{user.email}</td>
                  <td className="p-4 text-[#10b981] font-semibold">LKR {Number(user.balance).toLocaleString()}</td>
                  <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === "active" ? "bg-[#10b981]/20 text-[#10b981]" : user.status === "pending" ? "bg-[#f59e0b]/20 text-[#f59e0b]" : "bg-[#ef4444]/20 text-[#ef4444]"}`}>{user.status}</span></td>
                  <td className="p-4"><div className="flex gap-2">
                    <button onClick={() => setSelectedUser(user)} className="w-8 h-8 bg-[#3b82f6]/20 text-[#3b82f6] rounded-lg flex items-center justify-center hover:bg-[#3b82f6]/30"><Eye className="h-4 w-4" /></button>
                    <button className="w-8 h-8 bg-[#f59e0b]/20 text-[#f59e0b] rounded-lg flex items-center justify-center hover:bg-[#f59e0b]/30"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => deleteMutation.mutate(user.id)} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="p-8 text-center text-[#6b7280]">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-[#1a2332] max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-[#2a3a4d]" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2a3a4d]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                  {selectedUser.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedUser.firstName || selectedUser.username} {selectedUser.lastName || ""}</h2>
                  <p className="text-[#6b7280]">@{selectedUser.username}</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${selectedUser.status === "active" ? "bg-[#10b981]/20 text-[#10b981]" : selectedUser.status === "pending" ? "bg-[#f59e0b]/20 text-[#f59e0b]" : "bg-[#ef4444]/20 text-[#ef4444]"}`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="w-10 h-10 bg-[#2a3a4d] hover:bg-[#374151] rounded-lg flex items-center justify-center text-[#9ca3af]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="bg-[#0f1419] rounded-xl p-4 border border-[#2a3a4d]">
                <h3 className="text-[#9ca3af] text-sm uppercase font-medium mb-4 flex items-center gap-2"><Mail className="h-4 w-4" /> Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Email</p>
                    <p className="text-white">{selectedUser.email || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Mobile Number</p>
                    <p className="text-white">{selectedUser.mobileNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">First Name</p>
                    <p className="text-white">{selectedUser.firstName || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Last Name</p>
                    <p className="text-white">{selectedUser.lastName || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Balance Information */}
              <div className="bg-[#0f1419] rounded-xl p-4 border border-[#2a3a4d]">
                <h3 className="text-[#9ca3af] text-sm uppercase font-medium mb-4 flex items-center gap-2"><Wallet className="h-4 w-4" /> Balance Information</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-[#10b981]/10 rounded-lg p-3 border border-[#10b981]/30">
                    <p className="text-[#10b981] text-xs mb-1">Current Balance</p>
                    <p className="text-[#10b981] text-xl font-bold">LKR {Number(selectedUser.balance || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-[#3b82f6]/10 rounded-lg p-3 border border-[#3b82f6]/30">
                    <p className="text-[#3b82f6] text-xs mb-1">Withdrawable (Milestone)</p>
                    <p className="text-[#3b82f6] text-xl font-bold">LKR {Number(selectedUser.milestoneAmount || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-[#f59e0b]/10 rounded-lg p-3 border border-[#f59e0b]/30">
                    <p className="text-[#f59e0b] text-xs mb-1">Total Earned</p>
                    <p className="text-[#f59e0b] text-xl font-bold">LKR {Number(selectedUser.milestoneReward || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Destination Amount (Bonus)</p>
                    <p className="text-white font-semibold">LKR {Number(selectedUser.destinationAmount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Ongoing Milestone</p>
                    <p className="text-white font-semibold">LKR {Number(selectedUser.ongoingMilestone || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Pending Amount</p>
                    <p className="text-white font-semibold">LKR {Number(selectedUser.pendingAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Ad Statistics */}
              <div className="bg-[#0f1419] rounded-xl p-4 border border-[#2a3a4d]">
                <h3 className="text-[#9ca3af] text-sm uppercase font-medium mb-4 flex items-center gap-2"><Target className="h-4 w-4" /> Ad Statistics</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-[#8b5cf6]/10 rounded-lg p-3 border border-[#8b5cf6]/30">
                    <p className="text-[#8b5cf6] text-xs mb-1">Total Ads Completed</p>
                    <p className="text-[#8b5cf6] text-xl font-bold">{selectedUser.totalAdsCompleted || 0}</p>
                  </div>
                  <div className="bg-[#ec4899]/10 rounded-lg p-3 border border-[#ec4899]/30">
                    <p className="text-[#ec4899] text-xs mb-1">Points</p>
                    <p className="text-[#ec4899] text-xl font-bold">{selectedUser.points || 0}</p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Has Deposit</p>
                    <p className="text-white font-semibold">{selectedUser.hasDeposit ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>

              {/* Restriction/Promotion Info */}
              {(selectedUser.restrictionAdsLimit || selectedUser.restrictionDeposit || selectedUser.restrictionCommission) && (
                <div className="bg-[#0f1419] rounded-xl p-4 border border-[#f59e0b]/30">
                  <h3 className="text-[#f59e0b] text-sm uppercase font-medium mb-4 flex items-center gap-2"><Award className="h-4 w-4" /> Active Promotion</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[#6b7280] text-xs mb-1">Ads Limit</p>
                      <p className="text-white font-semibold">{selectedUser.restrictionAdsLimit || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[#6b7280] text-xs mb-1">Deposit Required</p>
                      <p className="text-white font-semibold">LKR {Number(selectedUser.restrictionDeposit || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#6b7280] text-xs mb-1">Commission</p>
                      <p className="text-white font-semibold">LKR {Number(selectedUser.restrictionCommission || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#6b7280] text-xs mb-1">Ads Completed</p>
                      <p className="text-white font-semibold">{selectedUser.restrictedAdsCompleted || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Details */}
              <div className="bg-[#0f1419] rounded-xl p-4 border border-[#2a3a4d]">
                <h3 className="text-[#9ca3af] text-sm uppercase font-medium mb-4 flex items-center gap-2"><Building2 className="h-4 w-4" /> Bank Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Bank Name</p>
                    <p className="text-white">{selectedUser.bankName || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Account Number</p>
                    <p className="text-white font-mono">{selectedUser.accountNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Account Holder Name</p>
                    <p className="text-white">{selectedUser.accountHolderName || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Branch Name</p>
                    <p className="text-white">{selectedUser.branchName || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-[#0f1419] rounded-xl p-4 border border-[#2a3a4d]">
                <h3 className="text-[#9ca3af] text-sm uppercase font-medium mb-4 flex items-center gap-2"><Calendar className="h-4 w-4" /> Account Information</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">User ID</p>
                    <p className="text-white font-mono text-sm">{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Admin Status</p>
                    <p className="text-white">{selectedUser.isAdmin ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Language</p>
                    <p className="text-white">{selectedUser.language || "en"}</p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Created At</p>
                    <p className="text-white">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Updated At</p>
                    <p className="text-white">{selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs mb-1">Notifications</p>
                    <p className="text-white">{selectedUser.notificationsEnabled ? "Enabled" : "Disabled"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-[#2a3a4d] flex justify-end gap-3">
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 bg-[#2a3a4d] hover:bg-[#374151] text-white rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#1a2332] max-w-md w-full rounded-2xl border border-[#2a3a4d]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[#2a3a4d]">
              <h2 className="text-xl font-bold text-white">Add New User</h2>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 bg-[#2a3a4d] hover:bg-[#374151] rounded-lg flex items-center justify-center text-[#9ca3af]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Full Name</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]"
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#2a3a4d] flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-[#2a3a4d] hover:bg-[#374151] text-white rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => createUserMutation.mutate(newUser)}
                disabled={createUserMutation.isPending || !newUser.username || !newUser.email || !newUser.password}
                className="px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {createUserMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
