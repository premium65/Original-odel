import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { UserCog, Plus, Edit, Trash2 } from "lucide-react";

export default function AdminAdmins() {
  const { data: admins, isLoading } = useQuery({ queryKey: ["admins"], queryFn: api.getAdmins });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#8b5cf6] flex items-center justify-center"><UserCog className="h-6 w-6 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-white">Admins</h1><p className="text-[#9ca3af]">Manage administrators</p></div>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-semibold rounded-lg flex items-center gap-2"><Plus className="h-4 w-4" /> Add Admin</button>
      </div>
      <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4d]">
        {isLoading ? <p className="text-[#6b7280]">Loading...</p> : admins?.map((admin: any) => (
          <div key={admin.id} className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl mb-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#eab308] rounded-full flex items-center justify-center text-white font-bold">{admin.username[0].toUpperCase()}</div>
              <div><p className="text-white font-semibold">{admin.username}</p><p className="text-[#6b7280] text-sm">{admin.role === "superadmin" ? "Super Administrator" : "Administrator"}</p></div>
            </div>
            <div className="flex gap-2">
              <button className="w-9 h-9 bg-[#3b82f6]/20 text-[#3b82f6] rounded-lg flex items-center justify-center"><Edit className="h-4 w-4" /></button>
              {admin.role !== "superadmin" && <button className="w-9 h-9 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
