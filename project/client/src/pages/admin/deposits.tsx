import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PiggyBank,
  Search,
  Check,
  X,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface Deposit {
  id: number;
  userId: number;
  amount: number;
  status: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  user?: User;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function AdminDeposits() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");

  // Fetch deposits
  const { data: deposits = [], isLoading } = useQuery<Deposit[]>({
    queryKey: ["/api/admin/deposits"],
  });

  // Fetch users for manual deposit
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Approve deposit
  const approveMutation = useMutation({
    mutationFn: async (depositId: number) => {
      const res = await fetch(`/api/admin/deposits/${depositId}/approve`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve deposit");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "Deposit approved and balance updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve deposit", variant: "destructive" });
    },
  });

  // Reject deposit
  const rejectMutation = useMutation({
    mutationFn: async (depositId: number) => {
      const res = await fetch(`/api/admin/deposits/${depositId}/reject`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reject deposit");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      toast({ title: "Success", description: "Deposit rejected" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject deposit", variant: "destructive" });
    },
  });

  // Create manual deposit
  const createDepositMutation = useMutation({
    mutationFn: async (data: { userId: number; amount: number; notes?: string }) => {
      const res = await fetch("/api/admin/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create deposit");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "Manual deposit created and balance updated" });
      setShowAddDialog(false);
      setSelectedUser(null);
      setDepositAmount("");
      setDepositNote("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create deposit", variant: "destructive" });
    },
  });

  // Filter deposits
  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = deposit.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || deposit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const pendingDeposits = deposits.filter(d => d.status === "pending");
  const approvedDeposits = deposits.filter(d => d.status === "approved");
  const totalApproved = approvedDeposits.reduce((sum, d) => sum + d.amount, 0);

  const handleCreateDeposit = () => {
    if (!selectedUser || !depositAmount) {
      toast({ title: "Error", description: "Please select user and enter amount", variant: "destructive" });
      return;
    }
    createDepositMutation.mutate({
      userId: selectedUser,
      amount: parseFloat(depositAmount),
      notes: depositNote || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Deposit Details</h1>
          <p className="text-[#9ca3af] mt-1">Manage user deposits and balances</p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#10b981] text-white rounded-xl hover:bg-[#059669] transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Manual Deposit</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Pending</p>
              <p className="text-2xl font-bold text-white">{pendingDeposits.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#10b981]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Total Approved</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalApproved)}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/20 flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-[#06b6d4]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Total Deposits</p>
              <p className="text-2xl font-bold text-white">{deposits.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search by username, name, or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-[#1a2332] border border-[#2a3a4d] rounded-xl text-white focus:border-[#10b981] focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Deposits Table */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a3a4d]">
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Transaction ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.length > 0 ? (
                filteredDeposits.map(deposit => (
                  <tr key={deposit.id} className="border-b border-[#2a3a4d] hover:bg-[#0f1419]/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center text-white font-bold">
                          {deposit.user?.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-white">{deposit.user?.fullName || deposit.user?.username || 'Unknown'}</p>
                          <p className="text-sm text-[#6b7280]">@{deposit.user?.username || 'unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#10b981] font-semibold">{formatCurrency(deposit.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-mono text-sm">{deposit.transactionId || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#9ca3af] text-sm">{formatDate(deposit.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        deposit.status === 'approved' ? 'bg-[#10b981]/20 text-[#10b981]' :
                        deposit.status === 'pending' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                        'bg-[#ef4444]/20 text-[#ef4444]'
                      }`}>
                        {deposit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {deposit.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveMutation.mutate(deposit.id)}
                            disabled={approveMutation.isPending}
                            className="p-2 bg-[#10b981]/20 text-[#10b981] rounded-lg hover:bg-[#10b981]/30 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate(deposit.id)}
                            disabled={rejectMutation.isPending}
                            className="p-2 bg-[#ef4444]/20 text-[#ef4444] rounded-lg hover:bg-[#ef4444]/30 transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#6b7280]">
                    No deposits found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Manual Deposit Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#10b981]/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#10b981]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Manual Deposit</h3>
                <p className="text-sm text-[#6b7280]">Add funds directly to user balance</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#9ca3af] mb-2">Select User</label>
                <select
                  value={selectedUser || ""}
                  onChange={(e) => setSelectedUser(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white focus:border-[#10b981] focus:outline-none"
                >
                  <option value="">Choose a user...</option>
                  {users.filter(u => u.status === "active").map(user => (
                    <option key={user.id} value={user.id}>
                      {user.fullName || user.username} (@{user.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9ca3af] mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9ca3af] mb-2">Notes (Optional)</label>
                <textarea
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddDialog(false)}
                className="flex-1 px-4 py-2.5 bg-[#2a3a4d] text-white rounded-lg hover:bg-[#3a4a5d] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeposit}
                disabled={createDepositMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors"
              >
                {createDepositMutation.isPending ? 'Processing...' : 'Add Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
