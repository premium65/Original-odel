import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { UserCog, Plus, Edit, Trash2, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminAdmins() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: ""
  });

  const { data: admins, isLoading } = useQuery({ queryKey: ["admins"], queryFn: api.getAdmins });

  const createAdminMutation = useMutation({
    mutationFn: (data: typeof newAdmin) => api.createUser({ ...data, role: "admin" }),
    onSuccess: () => {
      toast({ title: "Admin Created!", description: "New admin has been added successfully." });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setShowAddModal(false);
      setNewAdmin({ username: "", email: "", password: "", fullName: "", phone: "" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create admin", description: error.message, variant: "destructive" });
    }
  });

  const deleteAdminMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      toast({ title: "Admin Deleted!" });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete admin", description: error.message, variant: "destructive" });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#8b5cf6] flex items-center justify-center"><UserCog className="h-6 w-6 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-white">Admins</h1><p className="text-[#9ca3af]">Manage administrators</p></div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-semibold rounded-lg flex items-center gap-2"><Plus className="h-4 w-4" /> Add Admin</button>
      </div>
      <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4d]">
        {isLoading ? <p className="text-[#6b7280]">Loading...</p> : admins?.length === 0 ? (
          <p className="text-[#6b7280] text-center py-8">No admins found</p>
        ) : admins?.map((admin: any) => (
          <div key={admin.id} className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl mb-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#eab308] rounded-full flex items-center justify-center text-white font-bold">{admin.username?.[0]?.toUpperCase() || "A"}</div>
              <div>
                <p className="text-white font-semibold">{admin.username}</p>
                <p className="text-[#6b7280] text-sm">{admin.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="w-9 h-9 bg-[#3b82f6]/20 text-[#3b82f6] rounded-lg flex items-center justify-center hover:bg-[#3b82f6]/30"><Edit className="h-4 w-4" /></button>
              {admin.username !== "admin" && (
                <button
                  onClick={() => deleteAdminMutation.mutate(admin.id)}
                  disabled={deleteAdminMutation.isPending}
                  className="w-9 h-9 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#1a2332] max-w-md w-full rounded-2xl border border-[#2a3a4d]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[#2a3a4d]">
              <h2 className="text-xl font-bold text-white">Add New Admin</h2>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 bg-[#2a3a4d] hover:bg-[#374151] rounded-lg flex items-center justify-center text-[#9ca3af]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Username</label>
                <input
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#8b5cf6]"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Full Name</label>
                <input
                  type="text"
                  value={newAdmin.fullName}
                  onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#8b5cf6]"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Email</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#8b5cf6]"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Phone</label>
                <input
                  type="tel"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#8b5cf6]"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Password</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#8b5cf6]"
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#2a3a4d] flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-[#2a3a4d] hover:bg-[#374151] text-white rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => createAdminMutation.mutate(newAdmin)}
                disabled={createAdminMutation.isPending || !newAdmin.username || !newAdmin.email || !newAdmin.password}
                className="px-4 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {createAdminMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
