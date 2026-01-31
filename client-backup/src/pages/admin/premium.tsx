import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import type { User } from "@shared/schema";
import { Search, Mail, Phone } from "lucide-react";
import { RestrictUserDialog } from "@/components/restrict-user-dialog";
import { ResetConfirmDialog } from "@/components/reset-confirm-dialog";
import { AddValueDialog } from "@/components/add-value-dialog";
import { EditUserDialog, type EditUserData } from "@/components/edit-user-dialog";
import { EditBankDialog, type EditBankData } from "@/components/edit-bank-dialog";

export default function AdminPremium() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [restrictDialogOpen, setRestrictDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [addValueDialogOpen, setAddValueDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [editBankDialogOpen, setEditBankDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetField, setResetField] = useState<string>("");
  const [addValueField, setAddValueField] = useState<string>("");

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toString().includes(query)
    );
  });

  const setRestrictionMutation = useMutation({
    mutationFn: async ({ userId, adsLimit, deposit, commission, pendingAmount }: { 
      userId: number; 
      adsLimit: number; 
      deposit: string; 
      commission: string;
      pendingAmount: string;
    }) => {
      const response = await fetch(`/api/admin/users/${userId}/restrict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adsLimit, deposit, commission, pendingAmount }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to set restriction");
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      setRestrictDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "Restriction Applied",
        description: "User restriction has been set successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Restriction Failed",
        description: error.message,
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async ({ userId, field }: { userId: number; field: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field }),
      });
      if (!response.ok) throw new Error("Failed to reset");
      return response.json();
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Reset Successful", description: "Field has been reset to 0" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Reset Failed", description: error.message });
    },
  });

  const addValueMutation = useMutation({
    mutationFn: async ({ userId, field, amount }: { userId: number; field: string; amount: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/add-value`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, amount }),
      });
      if (!response.ok) throw new Error("Failed to add value");
      return response.json();
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Value Added", description: "Amount has been added successfully" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Add Failed", description: error.message });
    },
  });

  const editUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: EditUserData }) => {
      const response = await fetch(`/api/admin/users/${userId}/details`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update user details");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      setEditUserDialogOpen(false);
      setSelectedUser(null);
      toast({ title: "User Updated", description: "User details have been updated successfully." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    },
  });

  const editBankMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: EditBankData }) => {
      const response = await fetch(`/api/admin/users/${userId}/bank`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update bank details");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      setEditBankDialogOpen(false);
      setSelectedUser(null);
      toast({ title: "Bank Details Updated", description: "Bank details have been updated successfully." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    },
  });

  const handleRestrict = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setSelectedUser(user);
    
    if ((user as any).restrictionAdsLimit !== null && (user as any).restrictionAdsLimit !== undefined) {
      setDialogMode("edit");
    } else {
      setDialogMode("create");
    }
    
    setRestrictDialogOpen(true);
  };

  const handleRestrictionSubmit = (data: { adsLimit: number; deposit: string; commission: string; pendingAmount: string }) => {
    if (!selectedUser) return;
    setRestrictionMutation.mutate({ userId: selectedUser.id, ...data });
  };

  const handleReset = (userId: number, field: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setSelectedUser(user);
    setResetField(field);
    setResetDialogOpen(true);
  };

  const handleResetConfirm = () => {
    if (!selectedUser || !resetField) return;
    resetMutation.mutate({ userId: selectedUser.id, field: resetField });
    setResetDialogOpen(false);
    setSelectedUser(null);
    setResetField("");
  };

  const handleAdd = (userId: number, field: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setSelectedUser(user);
    setAddValueField(field);
    setAddValueDialogOpen(true);
  };

  const handleAddValueSubmit = (amount: string) => {
    if (!selectedUser || !addValueField) return;
    
    addValueMutation.mutate({ userId: selectedUser.id, field: addValueField, amount });
    
    setAddValueDialogOpen(false);
    setSelectedUser(null);
    setAddValueField("");
  };

  const handleEditUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setSelectedUser(user);
    setEditUserDialogOpen(true);
  };

  const handleEditUserSubmit = (data: EditUserData) => {
    if (!selectedUser) return;
    editUserMutation.mutate({ userId: selectedUser.id, data });
  };

  const handleEditBank = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setSelectedUser(user);
    setEditBankDialogOpen(true);
  };

  const handleEditBankSubmit = (data: EditBankData) => {
    if (!selectedUser) return;
    editBankMutation.mutate({ userId: selectedUser.id, data });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading premium users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-card border rounded-lg p-4">
        <h1 className="text-xl font-bold" style={{ color: '#B8936B' }}>
          Premium
        </h1>
        <div className="flex items-center gap-4 flex-1 max-w-2xl mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-premium"
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Hello, did you check the List of Premium Packages?
        </p>
      </div>

      {/* Premium Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8936B' }}>ID</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8936B' }}>Name</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8936B' }}>Email</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8936B' }}>Invitation Code</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8936B' }}>Phone</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8936B' }}>Total Booking</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8936B' }}>Booking</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8936B' }}>Points</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8936B' }}>Premium Treasure</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8936B' }}>Normal Treasure</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8936B' }}>Booking Value</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8936B' }}>Edit User</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8936B' }}>Bank Details</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-8 text-center text-muted-foreground">
                      {searchQuery ? "No users found matching your search" : "No users registered yet"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50" data-testid={`row-user-${user.id}`}>
                      <td className="px-3 py-3 text-sm">{user.id}</td>
                      <td className="px-3 py-3 text-sm font-medium">{user.fullName}</td>
                      <td className="px-3 py-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-center font-semibold">
                        {user.id * 15 + 60}
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{user.mobileNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium" data-testid={`text-total-booking-${user.id}`}>
                            {(user as any).totalAdsCompleted || 0}/{(user as any).restrictionAdsLimit || ''}
                          </span>
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-6 px-2"
                            onClick={() => handleRestrict(user.id)}
                            data-testid={`button-promotions-${user.id}`}
                          >
                            Promotions
                          </Button>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-6 px-3"
                          onClick={() => handleReset(user.id, 'booking')}
                          data-testid={`button-reset-booking-${user.id}`}
                        >
                          RESET
                        </Button>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium" data-testid={`text-points-${user.id}`}>
                            {user.points || 0}
                          </span>
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-6 px-3"
                            onClick={() => handleAdd(user.id, 'points')}
                            data-testid={`button-add-points-${user.id}`}
                          >
                            SET
                          </Button>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-6 px-3"
                          onClick={() => handleAdd(user.id, 'premiumTreasure')}
                          data-testid={`button-add-premium-${user.id}`}
                        >
                          ADD
                        </Button>
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-6 px-3"
                          onClick={() => handleAdd(user.id, 'normalTreasure')}
                          data-testid={`button-add-normal-${user.id}`}
                        >
                          ADD
                        </Button>
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-6 px-3"
                          onClick={() => handleAdd(user.id, 'bookingValue')}
                          data-testid={`button-add-value-${user.id}`}
                        >
                          ADD
                        </Button>
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-6 px-3"
                          onClick={() => handleEditUser(user.id)}
                          data-testid={`button-edit-user-${user.id}`}
                        >
                          EDIT
                        </Button>
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white text-xs h-6 px-3"
                          onClick={() => handleEditBank(user.id)}
                          data-testid={`button-edit-bank-${user.id}`}
                        >
                          EDIT
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Promotion Dialog */}
      <RestrictUserDialog
        open={restrictDialogOpen}
        onOpenChange={setRestrictDialogOpen}
        userName={selectedUser?.fullName || ""}
        onSubmit={handleRestrictionSubmit}
        isPending={setRestrictionMutation.isPending}
        mode={dialogMode}
        defaultValues={
          dialogMode === "edit" && selectedUser
            ? {
                adsLimit: (selectedUser as any).restrictionAdsLimit,
                deposit: (selectedUser as any).restrictionDeposit,
                commission: (selectedUser as any).restrictionCommission,
                pendingAmount: (selectedUser as any).ongoingMilestone,
              }
            : undefined
        }
      />

      {/* Reset Confirm Dialog */}
      <ResetConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        userName={selectedUser?.fullName || ""}
        fieldName={resetField === 'booking' ? 'Ad Count' : resetField}
        onConfirm={handleResetConfirm}
      />

      {/* Add Value Dialog */}
      <AddValueDialog
        open={addValueDialogOpen}
        onOpenChange={setAddValueDialogOpen}
        userName={selectedUser?.fullName || ""}
        fieldName={addValueField}
        onSubmit={handleAddValueSubmit}
        isPending={addValueMutation.isPending}
      />

      {/* Edit User Dialog */}
      {selectedUser && (
        <EditUserDialog
          open={editUserDialogOpen}
          onOpenChange={setEditUserDialogOpen}
          user={{
            id: selectedUser.id,
            username: selectedUser.username,
            mobileNumber: selectedUser.mobileNumber,
          }}
          onSubmit={handleEditUserSubmit}
          isPending={editUserMutation.isPending}
        />
      )}

      {/* Edit Bank Dialog */}
      {selectedUser && (
        <EditBankDialog
          open={editBankDialogOpen}
          onOpenChange={setEditBankDialogOpen}
          user={{
            id: selectedUser.id,
            username: selectedUser.username,
            bankName: selectedUser.bankName,
            accountNumber: selectedUser.accountNumber,
            accountHolderName: selectedUser.accountHolderName,
            branchName: selectedUser.branchName,
          }}
          onSubmit={handleEditBankSubmit}
          isPending={editBankMutation.isPending}
        />
      )}
    </div>
  );
}