import { useQuery } from "@tanstack/react-query";
import { 
  FileText, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download
} from "lucide-react";
import { useState } from "react";
import type { User, Withdrawal } from "@shared/schema";

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'earning' | 'bonus';
  userId: number;
  amount: number;
  status: string;
  description: string;
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

export default function AdminTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch withdrawals
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/admin/withdrawals"],
  });

  // Build unified transaction list
  const transactions: Transaction[] = [
    // Add withdrawals as transactions
    ...withdrawals.map(w => ({
      id: `w-${w.id}`,
      type: 'withdrawal' as const,
      userId: w.userId,
      amount: w.amount,
      status: w.status,
      description: `Withdrawal to ${w.bankName || 'Bank'}`,
      createdAt: w.createdAt || new Date().toISOString(),
      user: users.find(u => u.id === w.userId),
    })),
    // Add user earnings as bonus transactions (from balance increases)
    ...users
      .filter(u => (u.lifetimeEarnings || 0) > 0)
      .map(u => ({
        id: `e-${u.id}`,
        type: 'earning' as const,
        userId: u.id,
        amount: u.lifetimeEarnings || 0,
        status: 'completed',
        description: `Ads earnings (${u.totalAdsWatched || 0} ads watched)`,
        createdAt: u.createdAt || new Date().toISOString(),
        user: u,
      })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate totals
  const totalIncoming = transactions
    .filter(t => t.type === 'earning' || t.type === 'deposit' || t.type === 'bonus')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOutgoing = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const isLoading = usersLoading || withdrawalsLoading;

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
          <h1 className="text-3xl font-bold text-white">Transaction Details</h1>
          <p className="text-[#9ca3af] mt-1">View all system transactions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#2a3a4d] text-white rounded-xl hover:bg-[#3a4a5d] transition-colors">
          <Download className="w-5 h-5" />
          <span className="font-medium">Export</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-[#10b981]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Total Incoming</p>
              <p className="text-2xl font-bold text-[#10b981]">{formatCurrency(totalIncoming)}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ef4444]/20 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-[#ef4444]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Total Outgoing</p>
              <p className="text-2xl font-bold text-[#ef4444]">{formatCurrency(totalOutgoing)}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#8b5cf6]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Total Transactions</p>
              <p className="text-2xl font-bold text-white">{transactions.length}</p>
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
            placeholder="Search by user or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-3 bg-[#1a2332] border border-[#2a3a4d] rounded-xl text-white focus:border-[#10b981] focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="earning">Earnings</option>
          <option value="withdrawal">Withdrawals</option>
          <option value="deposit">Deposits</option>
          <option value="bonus">Bonuses</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-[#1a2332] border border-[#2a3a4d] rounded-xl text-white focus:border-[#10b981] focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a3a4d]">
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.slice(0, 100).map(tx => (
                  <tr key={tx.id} className="border-b border-[#2a3a4d] hover:bg-[#0f1419]/50">
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        tx.type === 'earning' ? 'bg-[#10b981]/20 text-[#10b981]' :
                        tx.type === 'withdrawal' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                        tx.type === 'deposit' ? 'bg-[#0ea5e9]/20 text-[#0ea5e9]' :
                        'bg-[#f59e0b]/20 text-[#f59e0b]'
                      }`}>
                        {tx.type === 'earning' || tx.type === 'deposit' ? (
                          <ArrowDownRight className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center text-white font-bold text-xs">
                          {tx.user?.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-white">{tx.user?.username || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#9ca3af]">{tx.description}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${
                        tx.type === 'earning' || tx.type === 'deposit' || tx.type === 'bonus'
                          ? 'text-[#10b981]'
                          : 'text-[#ef4444]'
                      }`}>
                        {tx.type === 'earning' || tx.type === 'deposit' || tx.type === 'bonus' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        tx.status === 'approved' || tx.status === 'completed'
                          ? 'bg-[#10b981]/20 text-[#10b981]'
                          : tx.status === 'pending'
                          ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                          : 'bg-[#ef4444]/20 text-[#ef4444]'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#6b7280] text-sm">{formatDate(tx.createdAt)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#6b7280]">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
