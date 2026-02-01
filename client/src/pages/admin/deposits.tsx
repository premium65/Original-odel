import { useState } from "react";
import { PiggyBank, Search, CheckCircle, XCircle, Clock, Eye, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";

export default function Deposits() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ["admin-deposits"],
    queryFn: api.getDeposits
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.getStats
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
    </div>
  );
}
