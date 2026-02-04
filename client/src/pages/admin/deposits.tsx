import { useState } from "react";
import { PiggyBank, Search, CheckCircle, XCircle, Clock, Eye, Loader2, Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Deposits() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showManualModal, setShowManualModal] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDescription, setDepositDescription] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ["admin-deposits"],
    queryFn: api.getDeposits
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.getStats
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users-for-deposit"],
    queryFn: api.getUsers
  });

  const filteredUsersForModal = users.filter((u: any) =>
    userSearch &&
    (u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
     u.email?.toLowerCase().includes(userSearch.toLowerCase()))
  ).slice(0, 5);

  const manualDepositMutation = useMutation({
    mutationFn: (data: { userId: string; amount: number; description?: string }) =>
      api.createManualDeposit(data),
    onSuccess: () => {
      toast({ title: "Deposit Added!", description: "Manual deposit has been added successfully." });
      queryClient.invalidateQueries({ queryKey: ["admin-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-for-deposit"] });
      setShowManualModal(false);
      setSelectedUser(null);
      setDepositAmount("");
      setDepositDescription("");
      setUserSearch("");
    },
    onError: (error: any) => {
      toast({ title: "Failed to add deposit", description: error.message, variant: "destructive" });
    }
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: "bg-[#10b981]/20 text-[#10b981]",
      completed: "bg-[#10b981]/20 text-[#10b981]",
      pending: "bg-[#f59e0b]/20 text-[#f59e0b]",
      rejected: "bg-[#ef4444]/20 text-[#ef4444]",
      failed: "bg-[#ef4444]/20 text-[#ef4444]",
    };
    const icons: Record<string, any> = {
      approved: CheckCircle,
      completed: CheckCircle,
      pending: Clock,
      rejected: XCircle,
      failed: XCircle
    };
    const style = styles[status] || styles.pending;
    const Icon = icons[status] || Clock;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${style}`}>
        <Icon className="h-3 w-3" /> {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filtered = deposits.filter((d: any) =>
    (filterStatus === "all" || d.status === filterStatus) &&
    (
      (d.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (d.reference?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )
  );

  // Calculate local stats from deposits list if needed, or use global stats
  const completedCount = deposits.filter((d: any) => d.status === "approved" || d.status === "completed").length;
  const pendingCount = deposits.filter((d: any) => d.status === "pending").length;
  const failedCount = deposits.filter((d: any) => d.status === "rejected" || d.status === "failed").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-[#10b981] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
            <PiggyBank className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Deposit Details</h1>
            <p className="text-[#9ca3af]">View and manage user deposits</p>
          </div>
        </div>
        <button
          onClick={() => setShowManualModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Manual Deposit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Deposits", value: `LKR ${(stats?.totalDeposits || 0).toLocaleString()}`, color: "#10b981" },
          { label: "Completed", value: completedCount.toString(), color: "#10b981" },
          { label: "Pending", value: pendingCount.toString(), color: "#f59e0b" },
          { label: "Failed/Rejected", value: failedCount.toString(), color: "#ef4444" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-4">
            <p className="text-[#9ca3af] text-sm">{stat.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6b7280]" />
            <input type="text" placeholder="Search by name or reference..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none">
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f1419]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Reference</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Method</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3a4d]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#9ca3af]">
                    No deposits found
                  </td>
                </tr>
              ) : (
                filtered.map((deposit: any) => (
                  <tr key={deposit.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 text-white font-mono text-sm">{deposit.reference || `DEP${deposit.id}`}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{deposit.username || "Unknown"}</p>
                        <p className="text-[#6b7280] text-sm">{deposit.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#10b981] font-semibold">LKR {Number(deposit.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-[#9ca3af]">{deposit.method}</td>
                    <td className="px-6 py-4 text-[#9ca3af] text-sm">
                      {deposit.createdAt ? format(new Date(deposit.createdAt), "yyyy-MM-dd HH:mm") : "-"}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(deposit.status)}</td>
                    <td className="px-6 py-4">
                      <button className="w-8 h-8 bg-[#3b82f6]/20 text-[#3b82f6] rounded-lg flex items-center justify-center hover:bg-[#3b82f6]/30">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Deposit Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowManualModal(false)}>
          <div className="bg-[#1a2332] max-w-md w-full rounded-2xl border border-[#2a3a4d]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[#2a3a4d]">
              <h2 className="text-xl font-bold text-white">Add Manual Deposit</h2>
              <button onClick={() => setShowManualModal(false)} className="w-8 h-8 bg-[#2a3a4d] hover:bg-[#374151] rounded-lg flex items-center justify-center text-[#9ca3af]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* User Selection */}
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Select User</label>
                {selectedUser ? (
                  <div className="flex items-center justify-between p-3 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedUser.username?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-white font-medium">{selectedUser.username}</p>
                        <p className="text-[#6b7280] text-sm">{selectedUser.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-[#ef4444] hover:text-[#f87171] text-sm"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center gap-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl px-4 py-3">
                      <Search className="h-5 w-5 text-[#6b7280]" />
                      <input
                        type="text"
                        placeholder="Search by username or email..."
                        className="bg-transparent border-none outline-none text-white w-full placeholder:text-[#6b7280]"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                    </div>
                    {filteredUsersForModal.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a2332] border border-[#2a3a4d] rounded-xl overflow-hidden z-10 shadow-lg">
                        {filteredUsersForModal.map((user: any) => (
                          <div
                            key={user.id}
                            className="px-4 py-3 hover:bg-[#2a3a4d] cursor-pointer flex justify-between items-center"
                            onClick={() => {
                              setSelectedUser(user);
                              setUserSearch("");
                            }}
                          >
                            <span className="text-white">{user.username}</span>
                            <span className="text-[#9ca3af] text-sm">{user.email}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Deposit Amount (LKR)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]"
                  placeholder="Enter amount"
                  min="0"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Description (Optional)</label>
                <input
                  type="text"
                  value={depositDescription}
                  onChange={(e) => setDepositDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]"
                  placeholder="e.g., Bonus deposit"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#2a3a4d] flex justify-end gap-3">
              <button onClick={() => setShowManualModal(false)} className="px-4 py-2 bg-[#2a3a4d] hover:bg-[#374151] text-white rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!selectedUser || !depositAmount) {
                    toast({ title: "Error", description: "Please select user and enter amount", variant: "destructive" });
                    return;
                  }

                  // Extract userId from selectedUser
                  // selectedUser is expected to be a user object from the API with an 'id' property
                  if (
                    typeof selectedUser !== "object" ||
                    selectedUser === null ||
                    !selectedUser.id ||
                    String(selectedUser.id).trim() === ""
                  ) {
                    toast({ title: "Invalid input", description: "Please select a valid user", variant: "destructive" });
                    return;
                  }

                  const userIdStr = String(selectedUser.id).trim();
                  const numAmount = parseFloat(String(depositAmount));

                  if (Number.isNaN(numAmount) || numAmount <= 0 || !Number.isFinite(numAmount)) {
                    toast({ title: "Invalid input", description: "Please provide a valid positive amount", variant: "destructive" });
                    return;
                  }

                  // Validate decimal precision (max 2 decimal places)
                  // Use mathematical check to avoid issues with scientific notation
                  if (Math.round(numAmount * 100) !== numAmount * 100) {
                    toast({ title: "Invalid input", description: "Amount must have at most 2 decimal places", variant: "destructive" });
                    return;
                  }

                  manualDepositMutation.mutate({
                    userId: userIdStr,
                    amount: numAmount,
                    description: depositDescription || undefined,
                  });
                }}
                disabled={manualDepositMutation.isPending || !selectedUser || !depositAmount}
                className="px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {manualDepositMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
