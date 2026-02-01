import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Clock, Check, X } from "lucide-react";

export default function AdminPendingUsers() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({ queryKey: ["pending-users"], queryFn: api.getPendingUsers });

  const approveMutation = useMutation({
    mutationFn: (id: number) => api.approveUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pending-users"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#f59e0b] flex items-center justify-center"><Clock className="h-6 w-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Pending Users</h1><p className="text-[#9ca3af]">Users awaiting approval</p></div>
      </div>
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[#2a3a4d]">
              <th className="text-left p-4 text-xs text-[#9ca3af] uppercase">User</th>
              <th className="text-left p-4 text-xs text-[#9ca3af] uppercase">Email</th>
              <th className="text-left p-4 text-xs text-[#9ca3af] uppercase">Registered</th>
              <th className="text-left p-4 text-xs text-[#9ca3af] uppercase">Actions</th>
            </tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={4} className="p-8 text-center text-[#6b7280]">Loading...</td></tr> :
               users?.length ? users.map((user: any) => (
                <tr key={user.id} className="border-b border-[#2a3a4d]">
                  <td className="p-4"><div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-full flex items-center justify-center text-white font-semibold">{user.username[0].toUpperCase()}</div>
                    <p className="text-white font-medium">{user.username}</p>
                  </div></td>
                  <td className="p-4 text-[#9ca3af]">{user.email}</td>
                  <td className="p-4 text-[#9ca3af]">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4"><div className="flex gap-2">
                    <button onClick={() => approveMutation.mutate(user.id)} className="px-3 py-1.5 bg-[#10b981] text-white rounded-lg flex items-center gap-1 text-sm"><Check className="h-4 w-4" /> Approve</button>
                    <button className="px-3 py-1.5 bg-[#ef4444] text-white rounded-lg flex items-center gap-1 text-sm"><X className="h-4 w-4" /> Reject</button>
                  </div></td>
                </tr>
              )) : <tr><td colSpan={4} className="p-8 text-center text-[#6b7280]">No pending users</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
