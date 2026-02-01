import { useState } from "react";
import { FileText, Search, ArrowUpRight, ArrowDownLeft, Eye, Download, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: api.getTransactions
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.getStats
  });

  const getTypeBadge = (type: string) => {
    const normalizedType = type === "withdraw" ? "withdrawal" : type === "deposit" ? "earning" : type;

    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      earning: { bg: "bg-[#10b981]/20", text: "text-[#10b981]", icon: ArrowDownLeft },
      withdrawal: { bg: "bg-[#ef4444]/20", text: "text-[#ef4444]", icon: ArrowUpRight },
      bonus: { bg: "bg-[#f59e0b]/20", text: "text-[#f59e0b]", icon: ArrowDownLeft },
      commission: { bg: "bg-[#8b5cf6]/20", text: "text-[#8b5cf6]", icon: ArrowDownLeft },
      deposit: { bg: "bg-[#10b981]/20", text: "text-[#10b981]", icon: ArrowDownLeft },
    };
    const style = styles[normalizedType] || styles.earning;
    const Icon = style.icon;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${style.bg} ${style.text}`}>
        <Icon className="h-3 w-3" /> {normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1)}
      </span>
    );
  };

  const filtered = transactions.filter((t: any) =>
    (filterType === "all" || t.type === filterType) &&
    (
      (t.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      `TXN${t.id.toString().padStart(3, '0')}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-[#3b82f6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Transaction Details</h1>
            <p className="text-[#9ca3af]">View all platform transactions</p>
          </div>
        </div>
        <button className="px-5 py-2.5 bg-[#1a2332] border border-[#2a3a4d] text-white font-medium rounded-xl flex items-center gap-2 hover:bg-[#2a3a4d]">
          <Download className="h-5 w-5" /> Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Volume", value: `LKR ${(stats?.totalDeposits || 0) + (stats?.totalWithdrawals || 0)}`, color: "#3b82f6" },
          { label: "Deposits", value: `LKR ${stats?.totalDeposits || 0}`, color: "#10b981" },
          { label: "Withdrawals", value: `LKR ${stats?.totalWithdrawals || 0}`, color: "#ef4444" },
          { label: "Commissions", value: `LKR ${stats?.totalCommission || 0}`, color: "#f59e0b" },
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
            <input type="text" placeholder="Search by user or reference..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none">
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdraw">Withdrawals</option>
            <option value="bonus">Bonuses</option>
            <option value="commission">Commissions</option>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9ca3af] uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3a4d]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#9ca3af]">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filtered.map((txn: any) => (
                  <tr key={txn.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 text-white font-mono text-sm">TXN{txn.id.toString().padStart(3, '0')}</td>
                    <td className="px-6 py-4 text-white font-medium">
                      <div>
                        <div>{txn.username || "Unknown User"}</div>
                        <div className="text-xs text-gray-500">{txn.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getTypeBadge(txn.type)}</td>
                    <td className="px-6 py-4 font-semibold" style={{ color: txn.type === "withdraw" ? "#ef4444" : "#10b981" }}>
                      {txn.type === "withdraw" ? "-" : "+"}LKR {(txn.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-[#9ca3af]">{txn.description}</td>
                    <td className="px-6 py-4 text-[#9ca3af] text-sm">
                      {txn.createdAt ? format(new Date(txn.createdAt), "yyyy-MM-dd HH:mm") : "-"}
                    </td>
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
    </div>
  );
}
