import { useState } from "react";
import { FileText, Search, ArrowUpRight, ArrowDownLeft, Eye, Download } from "lucide-react";

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  const [transactions] = useState([
    { id: 1, user: "John Doe", type: "earning", amount: 850, description: "Ad click reward", date: "2024-01-15 10:30", ref: "TXN001" },
    { id: 2, user: "Jane Smith", type: "withdrawal", amount: 5000, description: "Withdrawal to bank", date: "2024-01-15 11:45", ref: "TXN002" },
    { id: 3, user: "Bob Wilson", type: "bonus", amount: 25000, description: "Welcome bonus", date: "2024-01-14 09:15", ref: "TXN003" },
    { id: 4, user: "Alice Brown", type: "earning", amount: 120, description: "Milestone reward", date: "2024-01-14 08:30", ref: "TXN004" },
    { id: 5, user: "Charlie Davis", type: "commission", amount: 500, description: "Referral commission", date: "2024-01-13 16:20", ref: "TXN005" },
  ]);

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      earning: { bg: "bg-[#10b981]/20", text: "text-[#10b981]", icon: ArrowDownLeft },
      withdrawal: { bg: "bg-[#ef4444]/20", text: "text-[#ef4444]", icon: ArrowUpRight },
      bonus: { bg: "bg-[#f59e0b]/20", text: "text-[#f59e0b]", icon: ArrowDownLeft },
      commission: { bg: "bg-[#8b5cf6]/20", text: "text-[#8b5cf6]", icon: ArrowDownLeft },
    };
    const style = styles[type] || styles.earning;
    const Icon = style.icon;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${style.bg} ${style.text}`}>
        <Icon className="h-3 w-3" /> {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const filtered = transactions.filter(t => 
    (filterType === "all" || t.type === filterType) &&
    (t.user.toLowerCase().includes(searchTerm.toLowerCase()) || t.ref.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          { label: "Total Volume", value: "LKR 2.5M", color: "#3b82f6" },
          { label: "Earnings", value: "LKR 1.2M", color: "#10b981" },
          { label: "Withdrawals", value: "LKR 800K", color: "#ef4444" },
          { label: "Bonuses", value: "LKR 500K", color: "#f59e0b" },
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
            <option value="earning">Earnings</option>
            <option value="withdrawal">Withdrawals</option>
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
              {filtered.map((txn) => (
                <tr key={txn.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 text-white font-mono text-sm">{txn.ref}</td>
                  <td className="px-6 py-4 text-white font-medium">{txn.user}</td>
                  <td className="px-6 py-4">{getTypeBadge(txn.type)}</td>
                  <td className="px-6 py-4 font-semibold" style={{ color: txn.type === "withdrawal" ? "#ef4444" : "#10b981" }}>
                    {txn.type === "withdrawal" ? "-" : "+"}LKR {txn.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-[#9ca3af]">{txn.description}</td>
                  <td className="px-6 py-4 text-[#9ca3af] text-sm">{txn.date}</td>
                  <td className="px-6 py-4">
                    <button className="w-8 h-8 bg-[#3b82f6]/20 text-[#3b82f6] rounded-lg flex items-center justify-center hover:bg-[#3b82f6]/30">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
