import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Clock, Check, X } from "lucide-react";
import { useState } from "react";

export default function AdminPendingUsers() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["pending-users"],
    queryFn: api.getPendingUsers,
    retry: 1
  });

  const approveMutation = useMutation({
    mutationFn: (id: number | string) => api.approveUser(id),
    onSuccess: (data) => {
      setMessage({ type: 'success', text: `Account activated! User can now login.` });
      queryClient.invalidateQueries({ queryKey: ["pending-users"] });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: any) => {
      setMessage({ type: 'error', text: error.message || 'Failed to approve user' });
      setTimeout(() => setMessage(null), 3000);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number | string) => api.rejectUser(id),
    onSuccess: () => {
      setMessage({ type: 'success', text: 'User rejected and removed.' });
      queryClient.invalidateQueries({ queryKey: ["pending-users"] });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: any) => {
      setMessage({ type: 'error', text: error.message || 'Failed to reject user' });
      setTimeout(() => setMessage(null), 3000);
    }
  });

  return (
    <div className="space-y-6">
      {/* Success/Error Message Popup */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-medium animate-pulse`}>
          {message.type === 'success' ? '✓ ' : '✗ '}{message.text}
        </div>
      )}
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
               error ? <tr><td colSpan={4} className="p-8 text-center text-red-500">Error loading users. Please refresh.</td></tr> :
               users?.length ? users.map((user: any) => (
                <tr key={user.id} className="border-b border-[#2a3a4d]">
                  <td className="p-4"><div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-full flex items-center justify-center text-white font-semibold">{user.username[0].toUpperCase()}</div>
                    <p className="text-white font-medium">{user.username}</p>
                  </div></td>
                  <td className="p-4 text-[#9ca3af]">{user.email}</td>
                  <td className="p-4 text-[#9ca3af]">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4"><div className="flex gap-2">
                    <button onClick={() => approveMutation.mutate(user.id)} disabled={approveMutation.isPending} className="px-3 py-1.5 bg-[#10b981] text-white rounded-lg flex items-center gap-1 text-sm disabled:opacity-50"><Check className="h-4 w-4" /> Approve</button>
                    <button onClick={() => rejectMutation.mutate(user.id)} disabled={rejectMutation.isPending} className="px-3 py-1.5 bg-[#ef4444] text-white rounded-lg flex items-center gap-1 text-sm disabled:opacity-50"><X className="h-4 w-4" /> Reject</button>
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
