import { AdminLayout } from "@/components/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { useUsersList } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Star, Search, Phone, RotateCcw, Pencil, Plus, X, ArrowLeft } from "lucide-react";
export default function AdminPremiumManage() {
  const { user } = useAuth();
  const { data: users } = useUsersList();
  const { toast } = useToast();
  
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [dialogType, setDialogType] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  const [inputValue3, setInputValue3] = useState("");
  const [inputValue4, setInputValue4] = useState("");
  const [inputValue5, setInputValue5] = useState("");
  const [inputValue6, setInputValue6] = useState("");

  const depositMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string, amount: string }) => {
      return apiRequest("POST", `/api/users/${userId}/deposit`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Deposit added successfully" });
      closeDialog();
    }
  });

  const resetMutation = useMutation({
    mutationFn: async ({ userId, field }: { userId: string, field: string }) => {
      return apiRequest("POST", `/api/users/${userId}/reset`, { field });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Field reset successfully" });
      closeDialog();
    }
  });

  const restrictMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string, data: any }) => {
      return apiRequest("POST", `/api/users/${userId}/restrict`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Promotion applied" });
      closeDialog();
    }
  });

  const setBalanceMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string, amount: string }) => {
      return apiRequest("POST", `/api/users/${userId}/set-balance`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Balance set successfully" });
      closeDialog();
    }
  });

  const addFieldMutation = useMutation({
    mutationFn: async ({ userId, field, amount }: { userId: string, field: string, amount: string }) => {
      return apiRequest("POST", `/api/users/${userId}/add-field`, { field, amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Amount added successfully" });
      closeDialog();
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string, data: any }) => {
      return apiRequest("PATCH", `/api/users/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User updated successfully" });
      closeDialog();
    }
  });

  const freezeMutation = useMutation({
    mutationFn: async ({ userId, freeze }: { userId: string, freeze: boolean }) => {
      return apiRequest("PATCH", `/api/users/${userId}/status`, { status: freeze ? "frozen" : "active" });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: variables.freeze ? "User frozen" : "User unfrozen" });
      closeDialog();
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User deleted successfully" });
      closeDialog();
    }
  });

  const closeDialog = () => {
    setSelectedUser(null);
    setDialogType("");
    setInputValue("");
    setInputValue2("");
    setInputValue3("");
    setInputValue4("");
    setInputValue5("");
    setInputValue6("");
  };

  if (!(user as any)?.isAdmin) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  const filteredUsers = users?.filter(u => 
    u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    (u as any).mobileNumber?.includes(search)
  ) || [];

  const openDialog = (user: any, type: string) => {
    setSelectedUser(user);
    setDialogType(type);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="text-zinc-400 hover:text-white"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Star className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Premium Manage</h1>
            <p className="text-zinc-400">Manage user balances, deposits, and promotions</p>
          </div>
        </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>All Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-premium"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Phone</th>
                  <th className="pb-3 pr-4">Ads</th>
                  <th className="pb-3 pr-4">Balance</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.profileImageUrl || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {u.firstName?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{(u as any).mobileNumber || "N/A"}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm font-medium">{u.totalAdsCompleted || 0}/</span>
                      <span className="text-sm text-muted-foreground">{u.restrictionAdsLimit || 28}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm font-medium">LKR {parseFloat(u.milestoneAmount || "0").toFixed(0)}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Button
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white h-7 px-2 text-xs"
                          onClick={() => openDialog(u, "promotions")}
                          data-testid={`button-promotions-${u.id}`}
                        >
                          Promotions
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-500 text-orange-500 hover:bg-orange-500/10 h-7 px-2 text-xs"
                          onClick={() => openDialog(u, "reset")}
                          data-testid={`button-reset-${u.id}`}
                        >
                          RESET
                        </Button>
                        <Button
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white h-7 px-2 text-xs"
                          onClick={() => openDialog(u, "set")}
                          data-testid={`button-set-${u.id}`}
                        >
                          SET
                        </Button>
                        <Button
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white h-7 px-2 text-xs"
                          onClick={() => openDialog(u, "add-balance")}
                          data-testid={`button-add-balance-${u.id}`}
                        >
                          ADD
                        </Button>
                        <Button
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white h-7 px-2 text-xs"
                          onClick={() => openDialog(u, "add-reward")}
                          data-testid={`button-add-reward-${u.id}`}
                        >
                          ADD
                        </Button>
                        <Button
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white h-7 px-2 text-xs"
                          onClick={() => openDialog(u, "add-points")}
                          data-testid={`button-add-points-${u.id}`}
                        >
                          ADD
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white h-7 px-2 text-xs"
                          onClick={() => openDialog(u, "edit-user")}
                          data-testid={`button-edit-user-${u.id}`}
                        >
                          EDIT
                        </Button>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-2 text-xs"
                          onClick={() => openDialog(u, "edit-bank")}
                          data-testid={`button-edit-bank-${u.id}`}
                        >
                          EDIT
                        </Button>
                        <Button
                          size="sm"
                          className={`h-7 px-2 text-xs ${u.status === 'frozen' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'} text-white`}
                          onClick={() => openDialog(u, u.status === 'frozen' ? "unfreeze" : "freeze")}
                          data-testid={`button-freeze-${u.id}`}
                        >
                          {u.status === 'frozen' ? 'UNFREEZE' : 'FREEZE'}
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white h-7 px-2 text-xs"
                          onClick={() => openDialog(u, "delete")}
                          data-testid={`button-delete-${u.id}`}
                        >
                          DELETE
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Promotions Dialog */}
      <Dialog open={dialogType === "promotions"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Promotion for {selectedUser?.firstName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ads Limit</Label>
              <Input
                type="number"
                placeholder="e.g. 50"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                data-testid="input-promo-ads-limit"
              />
            </div>
            <div>
              <Label>Commission per Ad (LKR)</Label>
              <Input
                type="number"
                placeholder="e.g. 100"
                value={inputValue2}
                onChange={(e) => setInputValue2(e.target.value)}
                data-testid="input-promo-commission"
              />
            </div>
            <div>
              <Label>Required Deposit (LKR)</Label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={inputValue3}
                onChange={(e) => setInputValue3(e.target.value)}
                data-testid="input-promo-deposit"
              />
            </div>
            <div>
              <Label>Pending Amount (LKR)</Label>
              <Input
                type="number"
                placeholder="e.g. 0"
                value={inputValue4}
                onChange={(e) => setInputValue4(e.target.value)}
                data-testid="input-promo-pending"
              />
            </div>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => restrictMutation.mutate({
                userId: selectedUser?.id,
                data: {
                  adsLimit: parseInt(inputValue) || null,
                  commission: inputValue2 || null,
                  deposit: inputValue3 || null,
                  pendingAmount: inputValue4 || "0"
                }
              })}
              disabled={restrictMutation.isPending}
              data-testid="button-apply-promotion"
            >
              Apply Promotion
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Dialog */}
      <Dialog open={dialogType === "reset"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Field for {selectedUser?.firstName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Field to Reset</Label>
              <Select value={inputValue} onValueChange={setInputValue}>
                <SelectTrigger data-testid="select-reset-field">
                  <SelectValue placeholder="Choose field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="milestoneAmount">Milestone Amount</SelectItem>
                  <SelectItem value="milestoneReward">Milestone Reward</SelectItem>
                  <SelectItem value="ongoingMilestone">Ongoing Milestone</SelectItem>
                  <SelectItem value="destinationAmount">Destination Amount</SelectItem>
                  <SelectItem value="pendingAmount">Pending Amount</SelectItem>
                  <SelectItem value="totalAdsCompleted">Total Ads Completed</SelectItem>
                  <SelectItem value="restrictedAdsCompleted">Restricted Ads Completed</SelectItem>
                  <SelectItem value="points">Points</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => resetMutation.mutate({ userId: selectedUser?.id, field: inputValue })}
              disabled={!inputValue || resetMutation.isPending}
              data-testid="button-confirm-reset"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Zero
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set All Fields Dialog */}
      <Dialog open={dialogType === "set"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set All Fields - {selectedUser?.firstName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <Label>Milestone Amount (LKR)</Label>
              <Input
                type="number"
                placeholder={selectedUser?.milestoneAmount || "0"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                data-testid="input-set-milestone"
              />
              <p className="text-xs text-muted-foreground">Main balance (can be negative)</p>
            </div>
            <div>
              <Label>Ongoing Milestone (LKR)</Label>
              <Input
                type="number"
                placeholder={selectedUser?.ongoingMilestone || "0"}
                value={inputValue2}
                onChange={(e) => setInputValue2(e.target.value)}
                data-testid="input-set-ongoing"
              />
              <p className="text-xs text-muted-foreground">Locked/pending amount</p>
            </div>
            <div>
              <Label>Milestone Reward (LKR)</Label>
              <Input
                type="number"
                placeholder={selectedUser?.milestoneReward || "0"}
                value={inputValue3}
                onChange={(e) => setInputValue3(e.target.value)}
                data-testid="input-set-reward"
              />
              <p className="text-xs text-muted-foreground">Commission per ad</p>
            </div>
            <div>
              <Label>Destination Amount (LKR)</Label>
              <Input
                type="number"
                placeholder={selectedUser?.destinationAmount || "0"}
                value={inputValue4}
                onChange={(e) => setInputValue4(e.target.value)}
                data-testid="input-set-destination"
              />
              <p className="text-xs text-muted-foreground">Target goal</p>
            </div>
            <div>
              <Label>Total Ads Completed</Label>
              <Input
                type="number"
                placeholder={String(selectedUser?.totalAdsCompleted || 0)}
                value={inputValue5 || ""}
                onChange={(e) => setInputValue5(e.target.value)}
                data-testid="input-set-ads"
              />
            </div>
            <div>
              <Label>Points</Label>
              <Input
                type="number"
                placeholder={String(selectedUser?.points || 0)}
                value={inputValue6 || ""}
                onChange={(e) => setInputValue6(e.target.value)}
                data-testid="input-set-points"
              />
            </div>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                const updates: any = {};
                if (inputValue) updates.milestoneAmount = inputValue;
                if (inputValue2) updates.ongoingMilestone = inputValue2;
                if (inputValue3) updates.milestoneReward = inputValue3;
                if (inputValue4) updates.destinationAmount = inputValue4;
                if (inputValue5) updates.totalAdsCompleted = parseInt(inputValue5);
                if (inputValue6) updates.points = parseInt(inputValue6);
                updateUserMutation.mutate({ userId: selectedUser?.id, data: updates });
              }}
              disabled={updateUserMutation.isPending}
              data-testid="button-confirm-set-all"
            >
              Save All Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Balance Dialog */}
      <Dialog open={dialogType === "add-balance"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Balance - {selectedUser?.firstName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Balance: LKR {parseFloat(selectedUser?.milestoneAmount || "0").toFixed(2)}</Label>
            </div>
            <div>
              <Label>Amount to Add (LKR)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                data-testid="input-add-balance"
              />
            </div>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => depositMutation.mutate({ userId: selectedUser?.id, amount: inputValue })}
              disabled={!inputValue || depositMutation.isPending}
              data-testid="button-confirm-add-balance"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to Balance
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Reward Dialog */}
      <Dialog open={dialogType === "add-reward"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Milestone Reward - {selectedUser?.firstName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Reward: LKR {parseFloat(selectedUser?.milestoneReward || "0").toFixed(2)}</Label>
            </div>
            <div>
              <Label>Amount to Add (LKR)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                data-testid="input-add-reward"
              />
            </div>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => addFieldMutation.mutate({ userId: selectedUser?.id, field: "milestoneReward", amount: inputValue })}
              disabled={!inputValue || addFieldMutation.isPending}
              data-testid="button-confirm-add-reward"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to Reward
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Points Dialog */}
      <Dialog open={dialogType === "add-points"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Points - {selectedUser?.firstName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Points: {selectedUser?.points || 0}</Label>
            </div>
            <div>
              <Label>Points to Add</Label>
              <Input
                type="number"
                placeholder="Enter points"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                data-testid="input-add-points"
              />
            </div>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => addFieldMutation.mutate({ userId: selectedUser?.id, field: "points", amount: inputValue })}
              disabled={!inputValue || addFieldMutation.isPending}
              data-testid="button-confirm-add-points"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Points
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={dialogType === "edit-user"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User - {selectedUser?.firstName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>First Name</Label>
              <Input
                placeholder="First name"
                value={inputValue || selectedUser?.firstName || ""}
                onChange={(e) => setInputValue(e.target.value)}
                data-testid="input-edit-firstname"
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                placeholder="Last name"
                value={inputValue2 || selectedUser?.lastName || ""}
                onChange={(e) => setInputValue2(e.target.value)}
                data-testid="input-edit-lastname"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                placeholder="Phone number"
                value={inputValue3 || selectedUser?.phone || ""}
                onChange={(e) => setInputValue3(e.target.value)}
                data-testid="input-edit-phone"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={inputValue4 || selectedUser?.status || "active"} onValueChange={setInputValue4}>
                <SelectTrigger data-testid="select-edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="frozen">Frozen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => updateUserMutation.mutate({
                userId: selectedUser?.id,
                data: {
                  firstName: inputValue || selectedUser?.firstName,
                  lastName: inputValue2 || selectedUser?.lastName,
                  phone: inputValue3 || selectedUser?.phone,
                  status: inputValue4 || selectedUser?.status
                }
              })}
              disabled={updateUserMutation.isPending}
              data-testid="button-save-user"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Bank Dialog */}
      <Dialog open={dialogType === "edit-bank"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bank Details - {selectedUser?.firstName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Bank Name</Label>
              <Input
                placeholder="Bank name"
                value={inputValue || selectedUser?.bankName || ""}
                onChange={(e) => setInputValue(e.target.value)}
                data-testid="input-edit-bankname"
              />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input
                placeholder="Account number"
                value={inputValue2 || selectedUser?.bankAccountNumber || ""}
                onChange={(e) => setInputValue2(e.target.value)}
                data-testid="input-edit-account"
              />
            </div>
            <div>
              <Label>Account Holder Name</Label>
              <Input
                placeholder="Account holder name"
                value={inputValue3 || selectedUser?.bankAccountName || ""}
                onChange={(e) => setInputValue3(e.target.value)}
                data-testid="input-edit-holdername"
              />
            </div>
            <div>
              <Label>Branch</Label>
              <Input
                placeholder="Branch"
                value={inputValue4 || selectedUser?.bankBranch || ""}
                onChange={(e) => setInputValue4(e.target.value)}
                data-testid="input-edit-branch"
              />
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => updateUserMutation.mutate({
                userId: selectedUser?.id,
                data: {
                  bankName: inputValue || selectedUser?.bankName,
                  bankAccountNumber: inputValue2 || selectedUser?.bankAccountNumber,
                  bankAccountName: inputValue3 || selectedUser?.bankAccountName,
                  bankBranch: inputValue4 || selectedUser?.bankBranch
                }
              })}
              disabled={updateUserMutation.isPending}
              data-testid="button-save-bank"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Save Bank Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Freeze Dialog */}
      <Dialog open={dialogType === "freeze"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Freeze User Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to freeze <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>'s account?
            </p>
            <p className="text-sm text-amber-500">
              The user will not be able to login until unfrozen.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={closeDialog}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700"
                onClick={() => freezeMutation.mutate({ userId: selectedUser?.id, freeze: true })}
                disabled={freezeMutation.isPending}
                data-testid="button-confirm-freeze"
              >
                Freeze Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unfreeze Dialog */}
      <Dialog open={dialogType === "unfreeze"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unfreeze User Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to unfreeze <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>'s account?
            </p>
            <p className="text-sm text-green-500">
              The user will be able to login and use the platform again.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={closeDialog}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => freezeMutation.mutate({ userId: selectedUser?.id, freeze: false })}
                disabled={freezeMutation.isPending}
                data-testid="button-confirm-unfreeze"
              >
                Unfreeze Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={dialogType === "delete"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to permanently delete <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>'s account?
            </p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-500 font-medium">
                This action cannot be undone!
              </p>
              <ul className="text-sm text-red-400 mt-2 list-disc list-inside">
                <li>All user data will be deleted</li>
                <li>Transaction history will be deleted</li>
                <li>Payout history will be deleted</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={closeDialog}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => deleteUserMutation.mutate(selectedUser?.id)}
                disabled={deleteUserMutation.isPending}
                data-testid="button-confirm-delete"
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}
