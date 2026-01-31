import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ShieldCheck, 
  ShieldOff, 
  Search,
  Users,
  Crown,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export default function AdminAdmins() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ user: User; action: 'grant' | 'revoke' } | null>(null);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: number; isAdmin: boolean }) => {
      const res = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin }),
      });
      if (!res.ok) throw new Error("Failed to update admin status");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: variables.isAdmin 
          ? "Admin privileges granted successfully" 
          : "Admin privileges revoked successfully",
      });
      setConfirmDialog(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update admin status",
        variant: "destructive",
      });
    },
  });

  // Separate admins and regular users
  const admins = users.filter(u => u.isAdmin === 1);
  const regularUsers = users.filter(u => u.isAdmin !== 1 && u.status === "active");

  // Filter based on search
  const filteredAdmins = admins.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRegularUsers = regularUsers.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleAdmin = (user: User, action: 'grant' | 'revoke') => {
    setConfirmDialog({ user, action });
  };

  const confirmAction = () => {
    if (confirmDialog) {
      toggleAdminMutation.mutate({
        userId: confirmDialog.user.id,
        isAdmin: confirmDialog.action === 'grant',
      });
    }
  };

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
          <h1 className="text-3xl font-bold text-white">Admin Management</h1>
          <p className="text-[#9ca3af] mt-1">Manage administrator privileges</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-[#8b5cf6]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Total Admins</p>
              <p className="text-2xl font-bold text-white">{admins.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#10b981]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Active Users</p>
              <p className="text-2xl font-bold text-white">{regularUsers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0ea5e9]/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#0ea5e9]" />
            </div>
            <div>
              <p className="text-[#6b7280] text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
        <input
          type="text"
          placeholder="Search by name, username, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
        />
      </div>

      {/* Current Admins */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-[#f59e0b]" />
            <h2 className="text-lg font-semibold text-white">Current Administrators</h2>
            <span className="px-2.5 py-1 text-xs font-semibold bg-[#f59e0b]/20 text-[#f59e0b] rounded-full">
              {filteredAdmins.length}
            </span>
          </div>
        </div>
        <div className="p-4">
          {filteredAdmins.length > 0 ? (
            <div className="space-y-3">
              {filteredAdmins.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#eab308] flex items-center justify-center text-white font-bold text-lg">
                      {user.fullName?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{user.fullName || user.username}</p>
                        <Crown className="w-4 h-4 text-[#f59e0b]" />
                      </div>
                      <p className="text-sm text-[#6b7280]">@{user.username}</p>
                      <p className="text-xs text-[#6b7280]">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleAdmin(user, 'revoke')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#ef4444]/20 text-[#ef4444] rounded-lg hover:bg-[#ef4444]/30 transition-colors"
                  >
                    <ShieldOff className="w-4 h-4" />
                    <span className="text-sm font-medium">Revoke Admin</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#6b7280]">
              No administrators found
            </div>
          )}
        </div>
      </div>

      {/* Regular Users - Eligible for Admin */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[#10b981]" />
            <h2 className="text-lg font-semibold text-white">Active Users</h2>
            <span className="px-2.5 py-1 text-xs font-semibold bg-[#10b981]/20 text-[#10b981] rounded-full">
              {filteredRegularUsers.length}
            </span>
          </div>
          <p className="text-sm text-[#6b7280] mt-1">Grant admin privileges to active users</p>
        </div>
        <div className="p-4">
          {filteredRegularUsers.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredRegularUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center text-white font-bold text-lg">
                      {user.fullName?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user.fullName || user.username}</p>
                      <p className="text-sm text-[#6b7280]">@{user.username}</p>
                      <p className="text-xs text-[#6b7280]">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleAdmin(user, 'grant')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#10b981]/20 text-[#10b981] rounded-lg hover:bg-[#10b981]/30 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-sm font-medium">Make Admin</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#6b7280]">
              No eligible users found
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                confirmDialog.action === 'grant' ? 'bg-[#10b981]/20' : 'bg-[#ef4444]/20'
              }`}>
                {confirmDialog.action === 'grant' ? (
                  <ShieldCheck className="w-6 h-6 text-[#10b981]" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-[#ef4444]" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {confirmDialog.action === 'grant' ? 'Grant Admin Privileges?' : 'Revoke Admin Privileges?'}
                </h3>
                <p className="text-sm text-[#6b7280]">
                  {confirmDialog.user.fullName || confirmDialog.user.username}
                </p>
              </div>
            </div>
            <p className="text-[#9ca3af] mb-6">
              {confirmDialog.action === 'grant'
                ? 'This user will have full access to the admin panel and can manage all settings.'
                : 'This user will lose access to the admin panel immediately.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 px-4 py-2.5 bg-[#2a3a4d] text-white rounded-lg hover:bg-[#3a4a5d] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={toggleAdminMutation.isPending}
                className={`flex-1 px-4 py-2.5 rounded-lg transition-colors ${
                  confirmDialog.action === 'grant'
                    ? 'bg-[#10b981] text-white hover:bg-[#059669]'
                    : 'bg-[#ef4444] text-white hover:bg-[#dc2626]'
                }`}
              >
                {toggleAdminMutation.isPending ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
