import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, RotateCcw, Award, Gem, Wallet, UserCog, User, Building, AlertCircle, Loader2, X, Crown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  mobileNumber: string | null;
  status: string;
  bankName: string | null;
  accountNumber: string | null;
  accountHolderName: string | null;
  branchName: string | null;
  destinationAmount: string;
  milestoneAmount: string;
  milestoneReward: string;
  totalAdsCompleted: number;
  restrictionAdsLimit: number | null;
  restrictionDeposit: string | null;
  restrictionCommission: string | null;
  ongoingMilestone: string;
  restrictedAdsCompleted: number;
  points: number;
}

export default function AdminPremiumManage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [promotionForm, setPromotionForm] = useState({ adsLimit: "", deposit: "", pendingAmount: "", commission: "" });
  const [pointsValue, setPointsValue] = useState("");
  const [treasureForm, setTreasureForm] = useState({ type: "premium" as "premium" | "normal", amount: "" });
  const [bookingValue, setBookingValue] = useState("");
  const [userDetailsForm, setUserDetailsForm] = useState({ username: "", mobileNumber: "", password: "" });
  const [bankDetailsForm, setBankDetailsForm] = useState({ bankName: "", accountNumber: "", accountHolderName: "", branchName: "" });

  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (selectedUser) {
      setUserDetailsForm({ username: selectedUser.username, mobileNumber: selectedUser.mobileNumber || "", password: "" });
      setBankDetailsForm({ bankName: selectedUser.bankName || "", accountNumber: selectedUser.accountNumber || "", accountHolderName: selectedUser.accountHolderName || "", branchName: selectedUser.branchName || "" });
      if (selectedUser.restrictionAdsLimit) {
        setPromotionForm({ adsLimit: selectedUser.restrictionAdsLimit?.toString() || "", deposit: selectedUser.restrictionDeposit || "", pendingAmount: selectedUser.ongoingMilestone || "", commission: selectedUser.restrictionCommission || "" });
      } else {
        setPromotionForm({ adsLimit: "", deposit: "", pendingAmount: "", commission: "" });
      }
    }
  }, [selectedUser]);

  const createPromotionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/admin/users/${selectedUser?.id}/restrict`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }); toast({ title: "Success", description: "Promotion created!" }); setActiveModal(null); }
  });

  const resetMilestoneMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/users/${selectedUser?.id}/unrestrict`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }); toast({ title: "Success", description: "Milestone reset!" }); setActiveModal(null); }
  });

  const setPointsMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await fetch(`/api/admin/users/${selectedUser?.id}/add-value`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ field: "points", amount }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }); toast({ title: "Success", description: "Points updated!" }); setActiveModal(null); setPointsValue(""); }
  });

  const addTreasureMutation = useMutation({
    mutationFn: async (data: { type: string; amount: string }) => {
      const field = data.type === "premium" ? "premiumTreasure" : "normalTreasure";
      const res = await fetch(`/api/admin/users/${selectedUser?.id}/add-value`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ field, amount: data.amount }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }); toast({ title: "Success", description: "Treasure added!" }); setActiveModal(null); setTreasureForm({ type: "premium", amount: "" }); }
  });

  const addBookingValueMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await fetch(`/api/admin/users/${selectedUser?.id}/add-value`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ field: "bookingValue", amount }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }); toast({ title: "Success", description: "Booking value added!" }); setActiveModal(null); setBookingValue(""); }
  });

  const updateUserDetailsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/admin/users/${selectedUser?.id}/details`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }); toast({ title: "Success", description: "User details updated!" }); }
  });

  const updateBankDetailsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/admin/users/${selectedUser?.id}/bank`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }); toast({ title: "Success", description: "Bank details updated!" }); }
  });

  const actionCards = [
    { id: "create-promotion", title: "Create Promotion", description: "Set milestone restrictions", icon: Crown, iconBg: "bg-[#f59e0b]", badge: "⭐" },
    { id: "reset-milestone", title: "RESET Milestone", description: "Clear all progress", icon: RotateCcw, iconBg: "bg-[#ef4444]", disabled: !selectedUser?.restrictionAdsLimit },
    { id: "set-points", title: "SET Points", description: "Set user's point balance", icon: Award, iconBg: "bg-[#8b5cf6]" },
    { id: "add-treasure", title: "ADD Treasure", description: "Add premium/normal treasure", icon: Gem, iconBg: "bg-[#10b981]" },
    { id: "add-booking", title: "ADD Booking Value", description: "Add to milestone amount", icon: Wallet, iconBg: "bg-[#3b82f6]" },
    { id: "edit-user", title: "EDIT User/Bank", description: "Edit user & bank details", icon: UserCog, iconBg: "bg-[#6b7280]" }
  ];

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2 }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#f59e0b]">
          <Crown className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Premium Manage</h1>
          <p className="text-[#9ca3af]">Manage user milestones and premium features</p>
        </div>
      </div>

      {/* User Search Card */}
      <Card className="bg-[#1a2332] border-[#2a3a4d]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-[#f59e0b]" />
            Select User
          </CardTitle>
          <CardDescription className="text-[#6b7280]">Search and select a user to manage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
            <Input
              placeholder="Search by username, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#0f1419] border-[#2a3a4d] text-white placeholder:text-[#6b7280]"
            />
          </div>

          {searchTerm && filteredUsers.length > 0 && !selectedUser && (
            <div className="max-h-60 overflow-y-auto rounded-lg border border-[#2a3a4d] bg-[#0f1419]">
              {filteredUsers.slice(0, 10).map(user => (
                <div key={user.id} onClick={() => { setSelectedUser(user); setSearchTerm(""); }}
                  className="p-3 hover:bg-[#1a2332] cursor-pointer border-b border-[#2a3a4d] last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-[#6b7280] text-sm">{user.fullName} • {user.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.status === 'active' ? 'bg-[#10b981]/20 text-[#10b981]' :
                      user.status === 'pending' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-[#ef4444]/20 text-[#ef4444]'
                    }`}>{user.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected User */}
          {selectedUser && (
            <div className="p-4 rounded-lg bg-[#0f1419] border border-[#2a3a4d]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#3b82f6] flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{selectedUser.username}</p>
                    <p className="text-[#9ca3af] text-sm">{selectedUser.fullName}</p>
                    <p className="text-[#6b7280] text-xs">{selectedUser.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="text-[#6b7280] hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3a4d]">
                  <p className="text-[#6b7280] text-xs">Points</p>
                  <p className="text-white font-bold">{selectedUser.points}/100</p>
                </div>
                <div className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3a4d]">
                  <p className="text-[#6b7280] text-xs">Milestone Amount</p>
                  <p className={`font-bold ${parseFloat(selectedUser.milestoneAmount) < 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                    {formatCurrency(selectedUser.milestoneAmount)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3a4d]">
                  <p className="text-[#6b7280] text-xs">Milestone Reward</p>
                  <p className="text-[#10b981] font-bold">{formatCurrency(selectedUser.milestoneReward)}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3a4d]">
                  <p className="text-[#6b7280] text-xs">Destination</p>
                  <p className="text-[#3b82f6] font-bold">{formatCurrency(selectedUser.destinationAmount)}</p>
                </div>
              </div>

              {/* Active Promotion */}
              {selectedUser.restrictionAdsLimit && (
                <div className="mt-4 p-3 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-[#f59e0b]" />
                    <span className="text-[#f59e0b] font-medium text-sm">Active Promotion</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><p className="text-[#6b7280] text-xs">Ads Progress</p><p className="text-white">{selectedUser.restrictedAdsCompleted}/{selectedUser.restrictionAdsLimit}</p></div>
                    <div><p className="text-[#6b7280] text-xs">Deposit</p><p className="text-[#ef4444]">{formatCurrency(selectedUser.restrictionDeposit || "0")}</p></div>
                    <div><p className="text-[#6b7280] text-xs">Pending</p><p className="text-[#f59e0b]">{formatCurrency(selectedUser.ongoingMilestone)}</p></div>
                    <div><p className="text-[#6b7280] text-xs">Commission/Ad</p><p className="text-[#10b981]">{formatCurrency(selectedUser.restrictionCommission || "0")}</p></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actionCards.map(card => (
          <Card 
            key={card.id}
            className={`bg-[#1a2332] border-[#2a3a4d] overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:border-[#3b82f6] ${!selectedUser || card.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => selectedUser && !card.disabled && setActiveModal(card.id)}
          >
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${card.iconBg}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                {card.badge && <span className="text-2xl">{card.badge}</span>}
              </div>
              <h3 className="text-white font-bold mt-3">{card.title}</h3>
              <p className="text-[#6b7280] text-sm mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Promotion Modal */}
      <Dialog open={activeModal === "create-promotion"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="bg-[#1a2332] border-[#2a3a4d] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-[#f59e0b]" />{selectedUser?.restrictionAdsLimit ? "Edit" : "Create"} Promotion</DialogTitle>
            <DialogDescription className="text-[#6b7280]">Set milestone restrictions for {selectedUser?.username}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[#9ca3af]">Ads Count Limit</Label>
              <Input type="number" placeholder="e.g., 12" value={promotionForm.adsLimit} onChange={(e) => setPromotionForm({...promotionForm, adsLimit: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#9ca3af]">Deposit Amount (LKR)</Label>
              <Input type="number" placeholder="e.g., 5000" value={promotionForm.deposit} onChange={(e) => setPromotionForm({...promotionForm, deposit: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#9ca3af]">Pending Amount (LKR)</Label>
              <Input type="number" placeholder="e.g., 2000" value={promotionForm.pendingAmount} onChange={(e) => setPromotionForm({...promotionForm, pendingAmount: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#9ca3af]">Commission per Ad (LKR)</Label>
              <Input type="number" placeholder="e.g., 500" value={promotionForm.commission} onChange={(e) => setPromotionForm({...promotionForm, commission: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="border-[#2a3a4d] text-[#9ca3af]">Cancel</Button>
            <Button onClick={() => createPromotionMutation.mutate({ adsLimit: parseInt(promotionForm.adsLimit), deposit: promotionForm.deposit, commission: promotionForm.commission, pendingAmount: promotionForm.pendingAmount || promotionForm.deposit })} disabled={createPromotionMutation.isPending} className="bg-[#f59e0b] hover:bg-[#f59e0b]/80">
              {createPromotionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedUser?.restrictionAdsLimit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Milestone Modal */}
      <Dialog open={activeModal === "reset-milestone"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="bg-[#1a2332] border-[#2a3a4d] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#ef4444]"><RotateCcw className="h-5 w-5" />Reset Milestone</DialogTitle>
            <DialogDescription className="text-[#6b7280]">This will clear all milestone progress for {selectedUser?.username}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30">
              <p className="text-[#ef4444] text-sm"><strong>Warning:</strong> This action will:</p>
              <ul className="mt-2 text-sm text-[#9ca3af] space-y-1">
                <li>• Reset ads clicked count to 0</li>
                <li>• Remove all restriction settings</li>
                <li>• Clear pending milestone amount</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="border-[#2a3a4d] text-[#9ca3af]">Cancel</Button>
            <Button onClick={() => resetMilestoneMutation.mutate()} disabled={resetMilestoneMutation.isPending} className="bg-[#ef4444] hover:bg-[#ef4444]/80">
              {resetMilestoneMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Points Modal */}
      <Dialog open={activeModal === "set-points"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="bg-[#1a2332] border-[#2a3a4d] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-[#8b5cf6]" />Set Points</DialogTitle>
            <DialogDescription className="text-[#6b7280]">Set point balance for {selectedUser?.username} (max 100)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-[#0f1419] border border-[#2a3a4d]">
              <p className="text-[#6b7280] text-xs">Current Points</p>
              <p className="text-white text-2xl font-bold">{selectedUser?.points}/100</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[#9ca3af]">New Points Value</Label>
              <Input type="number" placeholder="0-100" min="0" max="100" value={pointsValue} onChange={(e) => setPointsValue(e.target.value)} className="bg-[#0f1419] border-[#2a3a4d] text-white" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="border-[#2a3a4d] text-[#9ca3af]">Cancel</Button>
            <Button onClick={() => setPointsMutation.mutate(pointsValue)} disabled={setPointsMutation.isPending} className="bg-[#8b5cf6] hover:bg-[#8b5cf6]/80">
              {setPointsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Set Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Treasure Modal */}
      <Dialog open={activeModal === "add-treasure"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="bg-[#1a2332] border-[#2a3a4d] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Gem className="h-5 w-5 text-[#10b981]" />Add Treasure</DialogTitle>
            <DialogDescription className="text-[#6b7280]">Add treasure for {selectedUser?.username}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#0f1419] border border-[#2a3a4d]">
                <p className="text-[#6b7280] text-xs">Premium Treasure</p>
                <p className="text-[#10b981] font-bold">{formatCurrency(selectedUser?.milestoneReward || "0")}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#0f1419] border border-[#2a3a4d]">
                <p className="text-[#6b7280] text-xs">Normal Treasure</p>
                <p className="text-[#3b82f6] font-bold">{formatCurrency(selectedUser?.destinationAmount || "0")}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#9ca3af]">Treasure Type</Label>
              <Select value={treasureForm.type} onValueChange={(v: "premium" | "normal") => setTreasureForm({...treasureForm, type: v})}>
                <SelectTrigger className="bg-[#0f1419] border-[#2a3a4d] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3a4d]">
                  <SelectItem value="premium" className="text-white">Premium Treasure</SelectItem>
                  <SelectItem value="normal" className="text-white">Normal Treasure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#9ca3af]">Amount (LKR)</Label>
              <Input type="number" placeholder="Enter amount" value={treasureForm.amount} onChange={(e) => setTreasureForm({...treasureForm, amount: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="border-[#2a3a4d] text-[#9ca3af]">Cancel</Button>
            <Button onClick={() => addTreasureMutation.mutate(treasureForm)} disabled={addTreasureMutation.isPending} className="bg-[#10b981] hover:bg-[#10b981]/80">
              {addTreasureMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Add Treasure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Booking Value Modal */}
      <Dialog open={activeModal === "add-booking"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="bg-[#1a2332] border-[#2a3a4d] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-[#3b82f6]" />Add Booking Value</DialogTitle>
            <DialogDescription className="text-[#6b7280]">Add to milestone amount for {selectedUser?.username}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-[#0f1419] border border-[#2a3a4d]">
              <p className="text-[#6b7280] text-xs">Current Milestone Amount</p>
              <p className={`text-2xl font-bold ${parseFloat(selectedUser?.milestoneAmount || "0") < 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>{formatCurrency(selectedUser?.milestoneAmount || "0")}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[#9ca3af]">Amount to Add (LKR)</Label>
              <Input type="number" placeholder="Enter amount" value={bookingValue} onChange={(e) => setBookingValue(e.target.value)} className="bg-[#0f1419] border-[#2a3a4d] text-white" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="border-[#2a3a4d] text-[#9ca3af]">Cancel</Button>
            <Button onClick={() => addBookingValueMutation.mutate(bookingValue)} disabled={addBookingValueMutation.isPending} className="bg-[#3b82f6] hover:bg-[#3b82f6]/80">
              {addBookingValueMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Add Value
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User/Bank Modal */}
      <Dialog open={activeModal === "edit-user"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="bg-[#1a2332] border-[#2a3a4d] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserCog className="h-5 w-5 text-[#6b7280]" />Edit User & Bank Details</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <h4 className="text-white font-medium flex items-center gap-2"><User className="h-4 w-4" />User Details</h4>
              <div className="space-y-2">
                <Label className="text-[#9ca3af]">Username</Label>
                <Input value={userDetailsForm.username} onChange={(e) => setUserDetailsForm({...userDetailsForm, username: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#9ca3af]">Mobile Number</Label>
                <Input value={userDetailsForm.mobileNumber} onChange={(e) => setUserDetailsForm({...userDetailsForm, mobileNumber: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#9ca3af]">New Password</Label>
                <Input type="password" placeholder="Leave blank to keep" value={userDetailsForm.password} onChange={(e) => setUserDetailsForm({...userDetailsForm, password: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" />
              </div>
              <Button onClick={() => updateUserDetailsMutation.mutate(userDetailsForm)} disabled={updateUserDetailsMutation.isPending} className="w-full bg-[#6b7280] hover:bg-[#6b7280]/80">
                {updateUserDetailsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Update User
              </Button>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-medium flex items-center gap-2"><Building className="h-4 w-4" />Bank Details</h4>
              <div className="space-y-2">
                <Label className="text-[#9ca3af]">Bank Name</Label>
                <Input value={bankDetailsForm.bankName} onChange={(e) => setBankDetailsForm({...bankDetailsForm, bankName: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#9ca3af]">Account Number</Label>
                <Input value={bankDetailsForm.accountNumber} onChange={(e) => setBankDetailsForm({...bankDetailsForm, accountNumber: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#9ca3af]">Account Holder</Label>
                <Input value={bankDetailsForm.accountHolderName} onChange={(e) => setBankDetailsForm({...bankDetailsForm, accountHolderName: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#9ca3af]">Branch</Label>
                <Input value={bankDetailsForm.branchName} onChange={(e) => setBankDetailsForm({...bankDetailsForm, branchName: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" />
              </div>
              <Button onClick={() => updateBankDetailsMutation.mutate(bankDetailsForm)} disabled={updateBankDetailsMutation.isPending} className="w-full bg-[#6b7280] hover:bg-[#6b7280]/80">
                {updateBankDetailsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Update Bank
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="border-[#2a3a4d] text-[#9ca3af]">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
