import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { HandCoins, Check, X } from "lucide-react";

export default function AdminWithdrawals() {
  const queryClient = useQueryClient();
  const { data: withdrawals, isLoading } = useQuery({ queryKey: ["withdrawals"], queryFn: api.getWithdrawals });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.updateWithdrawal(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["withdrawals"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#ef4444] flex items-center justify-center"><HandCoins className="h-6 w-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Withdraw List</h1><p className="text-[#9ca3af]">Manage withdrawal requests</p></div>
      </div>
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <table className="w-full">
          <thead><tr className="border-b border-[#2a3a4d]">
            <th className="text-left p-4 text-xs text-[#9ca3af] uppercase">User</th>
            <th className="text-left p-4 text-xs text-[#9ca3af] uppercase">Amount</th>
            <th className="text-left p-4 text-xs text-[#9ca3af] uppercase">Bank</th>
            <th className="text-left p-4 text-xs text-[#9ca3af] uppercase">Status</th>
            <th className="text-left p-4 text-xs text-[#9ca3af] uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={5} className="p-8 text-center text-[#6b7280]">Loading...</td></tr> :
             withdrawals?.map((w: any) => (
              <tr key={w.id} className="border-b border-[#2a3a4d]">
                <td className="p-4 text-white">{w.username}</td>
                <td className="p-4 text-[#ef4444] font-semibold">LKR {Number(w.amount).toLocaleString()}</td>
                <td className="p-4 text-[#9ca3af]">{w.bankName} - {w.bankAccount}</td>
                <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs ${w.status === "approved" ? "bg-[#10b981]/20 text-[#10b981]" : w.status === "pending" ? "bg-[#f59e0b]/20 text-[#f59e0b]" : "bg-[#ef4444]/20 text-[#ef4444]"}`}>{w.status}</span></td>
                <td className="p-4">{w.status === "pending" && <div className="flex gap-2">
                  <button onClick={() => updateMutation.mutate({ id: w.id, status: "approved" })} className="w-8 h-8 bg-[#10b981]/20 text-[#10b981] rounded-lg flex items-center justify-center"><Check className="h-4 w-4" /></button>
                  <button onClick={() => updateMutation.mutate({ id: w.id, status: "rejected" })} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center"><X className="h-4 w-4" /></button>
                </div>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
