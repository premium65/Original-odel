import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Users, Search, Plus, Edit, Trash2, Eye, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = useQuery({ queryKey: ["users"], queryFn: api.getUsers });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
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
        <button className="px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-lg flex items-center gap-2"><Plus className="h-4 w-4" /> Add User</button>
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
                    <button className="w-8 h-8 bg-[#3b82f6]/20 text-[#3b82f6] rounded-lg flex items-center justify-center hover:bg-[#3b82f6]/30"><Eye className="h-4 w-4" /></button>
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
    </div>
  );
}
