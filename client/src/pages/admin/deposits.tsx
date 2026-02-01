import { useState } from "react";
import { PiggyBank, Search, CheckCircle, XCircle, Clock, Plus, Loader2, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Deposits() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeposit, setNewDeposit] = useState({ userId: "", amount: "", notes: "" });

  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ["admin-deposits"],
    queryFn: api.getDeposits
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.getStats
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PUT", `/api/admin/transactions/deposits/${id}`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-deposits"] });
      toast({
        title: variables.status === "approved" ? "Deposit Approved" : "Deposit Rejected",
        description: `Deposit has been ${variables.status}`
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update deposit", variant: "destructive" });
    }
  });

  const addDepositMutation = useMutation({
    mutationFn: async (data: { userId: string; amount: number; notes: string }) => {
      return apiRequest("POST", "/api/admin/deposits", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowAddModal(false);
      setNewDeposit({ userId: "", amount: "", notes: "" });
      toast({ title: "Success", description: "Deposit added to user balance" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add deposit", variant: "destructive" });
    }
  });

  const handleAddDeposit = () => {
    if (!newDeposit.userId || !newDeposit.amount) {
      toast({ title: "Error", description: "Please select user and enter amount", variant: "destructive" });
      return;
    }
    addDepositMutation.mutate({
      userId: newDeposit.userId,
      amount: parseFloat(newDeposit.amount),
      notes: newDeposit.notes
    });
  };

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
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90"
        >
          <Plus className="h-5 w-5" /> Add Manual Deposit
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Actions</th>
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
                    <td className="px-6 py-4 text-[#9ca3af]">{deposit.method || "Manual"}</td>
                    <td className="px-6 py-4 text-[#9ca3af] text-sm">
                      {deposit.createdAt ? format(new Date(deposit.createdAt), "yyyy-MM-dd HH:mm") : "-"}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(deposit.status)}</td>
                    <td className="px-6 py-4">
                      {deposit.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveMutation.mutate({ id: deposit.id, status: "approved" })}
                            disabled={approveMutation.isPending}
                            className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg hover:bg-[#10b981]/30 flex items-center gap-1"
                          >
                            <CheckCircle className="h-4 w-4" /> Approve
                          </button>
                          <button
                            onClick={() => approveMutation.mutate({ id: deposit.id, status: "rejected" })}
                            disabled={approveMutation.isPending}
                            className="px-3 py-1.5 bg-[#ef4444]/20 text-[#ef4444] text-sm rounded-lg hover:bg-[#ef4444]/30 flex items-center gap-1"
                          >
                            <XCircle className="h-4 w-4" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#6b7280] text-sm">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Manual Deposit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add Manual Deposit</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#6b7280] hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Select User</label>
                <select
                  value={newDeposit.userId}
                  onChange={(e) => setNewDeposit({ ...newDeposit, userId: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none"
                >
                  <option value="">Select a user...</option>
                  {Array.isArray(users) && users.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Amount (LKR)</label>
                <input
                  type="number"
                  value={newDeposit.amount}
                  onChange={(e) => setNewDeposit({ ...newDeposit, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Notes (optional)</label>
                <textarea
                  value={newDeposit.notes}
                  onChange={(e) => setNewDeposit({ ...newDeposit, notes: e.target.value })}
                  placeholder="Add notes..."
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none resize-none"
                  rows={3}
                />
              </div>
              <button
                onClick={handleAddDeposit}
                disabled={addDepositMutation.isPending}
                className="w-full py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50"
              >
                {addDepositMutation.isPending ? "Adding..." : "Add Deposit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
