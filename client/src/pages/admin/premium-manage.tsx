import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  Star, 
  RotateCcw, 
  Award, 
  Gem, 
  Wallet, 
  UserCog,
  User,
  Phone,
  Mail,
  CreditCard,
  Building,
  Hash,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Plus,
  Minus
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  mobileNumber: string | null;
  status: string;
  registeredAt: string;
  isAdmin: number;
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

  // Form states for each modal
  const [promotionForm, setPromotionForm] = useState({
    adsLimit: "",
    deposit: "",
    pendingAmount: "",
    commission: ""
  });
  const [pointsValue, setPointsValue] = useState("");
  const [treasureForm, setTreasureForm] = useState({
    type: "premium" as "premium" | "normal",
    amount: ""
  });
  const [bookingValue, setBookingValue] = useState("");
  const [userDetailsForm, setUserDetailsForm] = useState({
    username: "",
    mobileNumber: "",
    password: ""
  });
  const [bankDetailsForm, setBankDetailsForm] = useState({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    branchName: ""
  });

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update form values when user is selected
  useEffect(() => {
    if (selectedUser) {
      setUserDetailsForm({
        username: selectedUser.username,
        mobileNumber: selectedUser.mobileNumber || "",
        password: ""
      });
      setBankDetailsForm({
        bankName: selectedUser.bankName || "",
        accountNumber: selectedUser.accountNumber || "",
        accountHolderName: selectedUser.accountHolderName || "",
        branchName: selectedUser.branchName || ""
      });
      // If user has existing restriction, populate the form
      if (selectedUser.restrictionAdsLimit) {
        setPromotionForm({
          adsLimit: selectedUser.restrictionAdsLimit?.toString() || "",
          deposit: selectedUser.restrictionDeposit || "",
          pendingAmount: selectedUser.ongoingMilestone || "",
          commission: selectedUser.restrictionCommission || ""
        });
      } else {
        setPromotionForm({
          adsLimit: "",
          deposit: "",
          pendingAmount: "",
          commission: ""
        });
      }
    }
  }, [selectedUser]);

  // Mutation for creating/editing promotion (restriction)
  const createPromotionMutation = useMutation({
    mutationFn: async (data: { adsLimit: number; deposit: string; commission: string; pendingAmount: string }) => {
      const res = await fetch(`/api/admin/users/${selectedUser?.id}/restrict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create promotion");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "Promotion created successfully!" });
      setActiveModal(null);
      refreshSelectedUser();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Mutation for resetting milestone
  const resetMilestoneMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/users/${selectedUser?.id}/unrestrict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to reset milestone");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "Milestone reset successfully!" });
      setActiveModal(null);
      refreshSelectedUser();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Mutation for setting points
  const setPointsMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await fetch(`/api/admin/users/${selectedUser?.id}/add-value`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ field: "points", amount })
      });
      if (!res.ok) throw new Error("Failed to set points");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "Points updated successfully!" });
      setActiveModal(null);
      setPointsValue("");
      refreshSelectedUser();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Mutation for adding treasure
  const addTreasureMutation = useMutation({
    mutationFn: async (data: { type: string; amount: string }) => {
      const field = data.type === "premium" ? "premiumTreasure" : "normalTreasure";
      const res = await fetch(`/api/admin/users/${selectedUser?.id}/add-value`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ field, amount: data.amount })
      });
      if (!res.ok) throw new Error("Failed to add treasure");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "Treasure added successfully!" });
      setActiveModal(null);
      setTreasureForm({ type: "premium", amount: "" });
      refreshSelectedUser();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Mutation for adding booking value
  const addBookingValueMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await fetch(`/api/admin/users/${selectedUser?.id}/add-value`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ field: "bookingValue", amount })
      });
      if (!res.ok) throw new Error("Failed to add booking value");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "Booking value added successfully!" });
      setActiveModal(null);
      setBookingValue("");
      refreshSelectedUser();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Mutation for updating user details
  const updateUserDetailsMutation = useMutation({
    mutationFn: async (data: { username?: string; mobileNumber?: string; password?: string }) => {
      const res = await fetch(`/api/admin/users/${selectedUser?.id}/details`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update user details");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User details updated successfully!" });
      refreshSelectedUser();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Mutation for updating bank details
  const updateBankDetailsMutation = useMutation({
    mutationFn: async (data: { bankName?: string; accountNumber?: string; accountHolderName?: string; branchName?: string }) => {
      const res = await fetch(`/api/admin/users/${selectedUser?.id}/bank`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update bank details");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "Bank details updated successfully!" });
      refreshSelectedUser();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Refresh selected user data
  const refreshSelectedUser = () => {
    if (selectedUser) {
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }
  };

  // Action cards configuration
  const actionCards = [
    {
      id: "create-promotion",
      title: "Create Promotion",
      description: "Set milestone restrictions for user",
      icon: Star,
      gradient: "from-amber-500 to-orange-600",
      badge: "⭐",
      disabled: !selectedUser
    },
    {
      id: "reset-milestone",
      title: "RESET Milestone",
      description: "Clear all milestone progress",
      icon: RotateCcw,
      gradient: "from-red-500 to-rose-600",
      badge: null,
      disabled: !selectedUser || !selectedUser.restrictionAdsLimit
    },
    {
      id: "set-points",
      title: "SET Points",
      description: "Manually set user's point balance",
      icon: Award,
      gradient: "from-purple-500 to-violet-600",
      badge: null,
      disabled: !selectedUser
    },
    {
      id: "add-treasure",
      title: "ADD Treasure",
      description: "Add premium or normal treasure",
      icon: Gem,
      gradient: "from-emerald-500 to-teal-600",
      badge: null,
      disabled: !selectedUser
    },
    {
      id: "add-booking",
      title: "ADD Booking Value",
      description: "Add to user's milestone amount",
      icon: Wallet,
      gradient: "from-blue-500 to-indigo-600",
      badge: null,
      disabled: !selectedUser
    },
    {
      id: "edit-user",
      title: "EDIT User/Bank",
      description: "Edit user details and bank info",
      icon: UserCog,
      gradient: "from-slate-500 to-gray-600",
      badge: null,
      disabled: !selectedUser
    }
  ];

  // Format currency
  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
          <Star className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Premium Manage</h1>
          <p className="text-gray-400">Manage user milestones and premium features</p>
        </div>
      </div>

      {/* User Search & Selection */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-amber-500" />
            Select User
          </CardTitle>
          <CardDescription className="text-gray-400">
            Search and select a user to manage their premium settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by username, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#16213e] border-gray-600 text-white placeholder:text-gray-500"
            />
          </div>

          {searchTerm && filteredUsers.length > 0 && !selectedUser && (
            <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-700 bg-[#16213e]">
              {filteredUsers.slice(0, 10).map(user => (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    setSearchTerm("");
                  }}
                  className="p-3 hover:bg-[#1f2937] cursor-pointer border-b border-gray-700 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-gray-400 text-sm">{user.fullName} • {user.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      user.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected User Display */}
          {selectedUser && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{selectedUser.username}</p>
                    <p className="text-gray-400 text-sm">{selectedUser.fullName}</p>
                    <p className="text-gray-500 text-xs">{selectedUser.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* User Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="p-3 rounded-lg bg-[#16213e] border border-gray-700">
                  <p className="text-gray-400 text-xs">Points</p>
                  <p className="text-white font-bold">{selectedUser.points}/100</p>
                </div>
                <div className="p-3 rounded-lg bg-[#16213e] border border-gray-700">
                  <p className="text-gray-400 text-xs">Milestone Amount</p>
                  <p className={`font-bold ${parseFloat(selectedUser.milestoneAmount) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {formatCurrency(selectedUser.milestoneAmount)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#16213e] border border-gray-700">
                  <p className="text-gray-400 text-xs">Milestone Reward</p>
                  <p className="text-emerald-400 font-bold">{formatCurrency(selectedUser.milestoneReward)}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#16213e] border border-gray-700">
                  <p className="text-gray-400 text-xs">Destination</p>
                  <p className="text-blue-400 font-bold">{formatCurrency(selectedUser.destinationAmount)}</p>
                </div>
              </div>

              {/* Restriction Status */}
              {selectedUser.restrictionAdsLimit && (
                <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    <span className="text-amber-400 font-medium text-sm">Active Promotion</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Ads Progress</p>
                      <p className="text-white">{selectedUser.restrictedAdsCompleted}/{selectedUser.restrictionAdsLimit}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Deposit</p>
                      <p className="text-red-400">{formatCurrency(selectedUser.restrictionDeposit || "0")}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Pending</p>
                      <p className="text-orange-400">{formatCurrency(selectedUser.ongoingMilestone)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Commission/Ad</p>
                      <p className="text-green-400">{formatCurrency(selectedUser.restrictionCommission || "0")}</p>
                    </div>
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
            className={`bg-[#1a1a2e] border-gray-700 overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-gray-500 ${card.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !card.disabled && setActiveModal(card.id)}
          >
            <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                {card.badge && (
                  <span className="text-2xl">{card.badge}</span>
                )}
              </div>
              <h3 className="text-white font-bold mt-3">{card.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Promotion Modal */}
      <Dialog open={activeModal === "create-promotion"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="bg-[#1a1a2e] border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              {selectedUser?.restrictionAdsLimit ? "Edit Promotion" : "Create Promotion"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Set milestone restrictions for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Ads Count Limit (Booking Count)</Label>
              <Input
                type="number"
                placeholder="e.g., 12"
                value={promotionForm.adsLimit}
                onChange={(e) => setPromotionForm({...promotionForm, adsLimit: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Deposit Amount (LKR)</Label>
              <Input
                type="number"
                placeholder="e.g., 5000"
                value={promotionForm.deposit}
                onChange={(e) => setPromotionForm({...promotionForm, deposit: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
              <p className="text-xs text-gray-500">Will show as negative to user</p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Withdraw Milestone / Pending Amount (LKR)</Label>
              <Input
                type="number"
                placeholder="e.g., 2000"
                value={promotionForm.pendingAmount}
                onChange={(e) => setPromotionForm({...promotionForm, pendingAmount: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
              <p className="text-xs text-gray-500">Locked/pending amount shown to user</p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Commission Reward per Ad (LKR)</Label>
              <Input
                type="number"
                placeholder="e.g., 500"
                value={promotionForm.commission}
                onChange={(e) => setPromotionForm({...promotionForm, commission: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="border-gray-600 text-gray-300">
              Cancel
            </Button>
            <Button 
              onClick={() => createPromotionMutation.mutate({
                adsLimit: parseInt(promotionForm.adsLimit),
                deposit: promotionForm.deposit,
                commission: promotionForm.commission,
                pendingAmount: promotionForm.pendingAmount || promotionForm.deposit
              })}
              disabled={createPromotionMutation.isPending || !promotionForm.adsLimit || !promotionForm.deposit || !promotionForm.commission}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              {createPromotionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedUser?.restrictionAdsLimit ? "Update" : "Create"} Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Milestone Modal */}
      <Dialog open={activeModal === "reset-milestone"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="bg-[#1a1a2e] border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <RotateCcw className="h-5 w-5" />
              Reset Milestone
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This will clear all milestone progress for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm">
                <strong>Warning:</strong> This action will:
              </p>
              <ul className="mt-2 text-sm text-gray-400 space-y-1">
                <li>• Reset ads clicked count to 0</li>
                <li>• Remove all restriction settings</li>
                <li>• Clear pending milestone amount</li>
                <li>• Delete all ad click history</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="border-gray-600 text-gray-300">
              Cancel
            </Button>
            <Button 
              onClick={() => resetMilestoneMutation.mutate()}
              disabled={resetMilestoneMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            >
              {resetMilestoneMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reset Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Points Modal */}
      <Dialog open={activeModal === "set-points"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="bg-[#1a1a2e] border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Set Points
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Set point balance for {selectedUser?.username} (max 100)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-[#16213e] border border-gray-700">
              <p className="text-gray-400 text-xs">Current Points</p>
              <p className="text-white text-2xl font-bold">{selectedUser?.points}/100</p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">New Points Value</Label>
              <Input
                type="number"
                placeholder="Enter value (0-100)"
                min="0"
                max="100"
                value={pointsValue}
                onChange={(e) => setPointsValue(e.target.value)}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="border-gray-600 text-gray-300">
              Cancel
            </Button>
            <Button 
              onClick={() => setPointsMutation.mutate(pointsValue)}
              disabled={setPointsMutation.isPending || !pointsValue || parseInt(pointsValue) > 100}
              className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
            >
              {setPointsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Set Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Treasure Modal */}
      <Dialog open={activeModal === "add-treasure"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="bg-[#1a1a2e] border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gem className="h-5 w-5 text-emerald-500" />
              Add Treasure
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Add treasure balance for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#16213e] border border-gray-700">
                <p className="text-gray-400 text-xs">Premium Treasure</p>
                <p className="text-emerald-400 font-bold">{formatCurrency(selectedUser?.milestoneReward || "0")}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#16213e] border border-gray-700">
                <p className="text-gray-400 text-xs">Normal Treasure</p>
                <p className="text-blue-400 font-bold">{formatCurrency(selectedUser?.destinationAmount || "0")}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Treasure Type</Label>
              <Select 
                value={treasureForm.type} 
                onValueChange={(value: "premium" | "normal") => setTreasureForm({...treasureForm, type: value})}
              >
                <SelectTrigger className="bg-[#16213e] border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-gray-700">
                  <SelectItem value="premium" className="text-white">Premium Treasure (Milestone Reward)</SelectItem>
                  <SelectItem value="normal" className="text-white">Normal Treasure (Destination Amount)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Amount to Add (LKR)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={treasureForm.amount}
                onChange={(e) => setTreasureForm({...treasureForm, amount: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="border-gray-600 text-gray-300">
              Cancel
            </Button>
            <Button 
              onClick={() => addTreasureMutation.mutate(treasureForm)}
              disabled={addTreasureMutation.isPending || !treasureForm.amount}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {addTreasureMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Treasure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Booking Value Modal */}
      <Dialog open={activeModal === "add-booking"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="bg-[#1a1a2e] border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-500" />
              Add Booking Value
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Add to milestone amount for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-[#16213e] border border-gray-700">
              <p className="text-gray-400 text-xs">Current Milestone Amount</p>
              <p className={`text-2xl font-bold ${parseFloat(selectedUser?.milestoneAmount || "0") < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {formatCurrency(selectedUser?.milestoneAmount || "0")}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Amount to Add (LKR)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={bookingValue}
                onChange={(e) => setBookingValue(e.target.value)}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="border-gray-600 text-gray-300">
              Cancel
            </Button>
            <Button 
              onClick={() => addBookingValueMutation.mutate(bookingValue)}
              disabled={addBookingValueMutation.isPending || !bookingValue}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {addBookingValueMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Booking Value
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User/Bank Modal */}
      <Dialog open={activeModal === "edit-user"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="bg-[#1a1a2e] border-gray-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-gray-400" />
              Edit User & Bank Details
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Update details for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* User Details Section */}
            <div className="space-y-4">
              <h4 className="text-white font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                User Details
              </h4>
              <div className="space-y-2">
                <Label className="text-gray-300">Username</Label>
                <Input
                  value={userDetailsForm.username}
                  onChange={(e) => setUserDetailsForm({...userDetailsForm, username: e.target.value})}
                  className="bg-[#16213e] border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Mobile Number</Label>
                <Input
                  value={userDetailsForm.mobileNumber}
                  onChange={(e) => setUserDetailsForm({...userDetailsForm, mobileNumber: e.target.value})}
                  className="bg-[#16213e] border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">New Password (optional)</Label>
                <Input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={userDetailsForm.password}
                  onChange={(e) => setUserDetailsForm({...userDetailsForm, password: e.target.value})}
                  className="bg-[#16213e] border-gray-600 text-white"
                />
              </div>
              <Button 
                onClick={() => updateUserDetailsMutation.mutate(userDetailsForm)}
                disabled={updateUserDetailsMutation.isPending}
                className="w-full bg-gradient-to-r from-slate-500 to-gray-600"
              >
                {updateUserDetailsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update User Details
              </Button>
            </div>

            {/* Bank Details Section */}
            <div className="space-y-4">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Bank Details
              </h4>
              <div className="space-y-2">
                <Label className="text-gray-300">Bank Name</Label>
                <Input
                  value={bankDetailsForm.bankName}
                  onChange={(e) => setBankDetailsForm({...bankDetailsForm, bankName: e.target.value})}
                  className="bg-[#16213e] border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Account Number</Label>
                <Input
                  value={bankDetailsForm.accountNumber}
                  onChange={(e) => setBankDetailsForm({...bankDetailsForm, accountNumber: e.target.value})}
                  className="bg-[#16213e] border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Account Holder Name</Label>
                <Input
                  value={bankDetailsForm.accountHolderName}
                  onChange={(e) => setBankDetailsForm({...bankDetailsForm, accountHolderName: e.target.value})}
                  className="bg-[#16213e] border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Branch Name</Label>
                <Input
                  value={bankDetailsForm.branchName}
                  onChange={(e) => setBankDetailsForm({...bankDetailsForm, branchName: e.target.value})}
                  className="bg-[#16213e] border-gray-600 text-white"
                />
              </div>
              <Button 
                onClick={() => updateBankDetailsMutation.mutate(bankDetailsForm)}
                disabled={updateBankDetailsMutation.isPending}
                className="w-full bg-gradient-to-r from-slate-500 to-gray-600"
              >
                {updateBankDetailsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Bank Details
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="border-gray-600 text-gray-300">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
