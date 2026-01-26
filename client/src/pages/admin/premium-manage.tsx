import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Crown, Target, Check, DollarSign, Search, RotateCcw, Zap, Gift, 
  PiggyBank, Edit, Save, X, AlertCircle, Clock, Eye, XCircle
} from "lucide-react";

interface PremiumUser {
  id: number;
  username: string;
  email: string;
  phone: string;
  plan: string;
  points: number;
  treasureType: string;
  bookingValue: number;
  milestone: {
    adsCountLimit: number;
    adsClickedCount: number;
    depositAmount: number;
    depositPaid: boolean;
    withdrawMilestone: number;
    commissionReward: number;
    milestoneStatus: string;
  };
  bankDetails: {
    bankName: string;
    accountNo: string;
    branch: string;
  };
}

export default function PremiumManage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<PremiumUser | null>(null);
  
  // Modal states
  const [showCreateMilestone, setShowCreateMilestone] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSetPoints, setShowSetPoints] = useState(false);
  const [showAddTreasure, setShowAddTreasure] = useState(false);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);

  // Form states
  const [milestoneForm, setMilestoneForm] = useState({
    adsCountLimit: "",
    depositAmount: "",
    withdrawMilestone: "",
    commissionReward: ""
  });
  const [pointsValue, setPointsValue] = useState("");
  const [treasureType, setTreasureType] = useState("premium");
  const [bookingValue, setBookingValue] = useState("");

  // Fetch premium users
  const { data: premiumUsers, isLoading } = useQuery<PremiumUser[]>({
    queryKey: ["/api/admin/premium-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/premium-users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch premium users");
      return res.json();
    },
  });

  // Mutations
  const createMilestone = useMutation({
    mutationFn: async (data: { userId: number; milestone: typeof milestoneForm }) => {
      const res = await fetch(`/api/admin/users/${data.userId}/milestone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data.milestone),
      });
      if (!res.ok) throw new Error("Failed to create milestone");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/premium-users"] });
      toast({ title: "Milestone created successfully!" });
      setShowCreateMilestone(false);
      setSelectedUser(null);
    },
  });

  const resetMilestone = useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`/api/admin/users/${userId}/milestone/reset`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reset milestone");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/premium-users"] });
      toast({ title: "Milestone reset successfully!" });
      setShowResetConfirm(false);
      setSelectedUser(null);
    },
  });

  const updatePoints = useMutation({
    mutationFn: async (data: { userId: number; points: number }) => {
      const res = await fetch(`/api/admin/users/${data.userId}/points`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ points: data.points }),
      });
      if (!res.ok) throw new Error("Failed to update points");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/premium-users"] });
      toast({ title: "Points updated successfully!" });
      setShowSetPoints(false);
      setSelectedUser(null);
    },
  });

  const filteredUsers = premiumUsers?.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    premiumUsers: premiumUsers?.length || 0,
    activeMilestones: premiumUsers?.filter(u => u.milestone?.milestoneStatus === 'in_progress').length || 0,
    completed: premiumUsers?.filter(u => u.milestone?.milestoneStatus === 'completed').length || 0,
    totalDeposits: premiumUsers?.reduce((sum, u) => sum + (u.milestone?.depositPaid ? u.milestone.depositAmount : 0), 0) || 0,
  };

  const planColors: Record<string, string> = {
    "Gold Plan": "bg-[#f59e0b]/20 text-[#f59e0b]",
    "Silver Plan": "bg-[#9ca3af]/20 text-[#9ca3af]",
    "Platinum Plan": "bg-[#8b5cf6]/20 text-[#8b5cf6]",
    "Starter Plan": "bg-[#10b981]/20 text-[#10b981]",
  };

  const avatarColors = [
    "from-[#f59e0b] to-[#d97706]",
    "from-[#9ca3af] to-[#6b7280]",
    "from-[#8b5cf6] to-[#7c3aed]",
    "from-[#10b981] to-[#059669]",
    "from-[#ec4899] to-[#db2777]",
  ];

  const adminActions = [
    { icon: Target, color: "#8b5cf6", label: "Promotions", desc: "Create Milestone" },
    { icon: RotateCcw, color: "#ef4444", label: "RESET", desc: "Restart milestone" },
    { icon: Zap, color: "#10b981", label: "SET Points", desc: "Set user points" },
    { icon: Gift, color: "#f59e0b", label: "ADD Treasure", desc: "Premium/Normal" },
    { icon: PiggyBank, color: "#ec4899", label: "ADD Booking", desc: "Booking value" },
    { icon: Edit, color: "#3b82f6", label: "EDIT", desc: "User/Bank details" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Crown className="w-7 h-7 text-[#f59e0b]" />
            Premium Manage
            <span className="px-2 py-1 text-xs bg-[#ef4444] text-white rounded-full animate-pulse">NEW</span>
          </h1>
          <p className="text-[#6b7280] mt-1">Manage premium users & milestone promotions (System review - No admin needed)</p>
        </div>
        <Button 
          onClick={() => setShowCreateMilestone(true)}
          className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:opacity-90"
        >
          <Target className="w-5 h-5 mr-2" /> Create Promotion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Premium Users", value: stats.premiumUsers, icon: Crown, gradient: "from-[#10b981] to-[#059669]" },
          { title: "Active Milestones", value: stats.activeMilestones, icon: Target, gradient: "from-[#3b82f6] to-[#2563eb]" },
          { title: "Completed", value: stats.completed, icon: Check, gradient: "from-[#8b5cf6] to-[#7c3aed]" },
          { title: "Total Deposits", value: `₹${stats.totalDeposits.toLocaleString()}`, icon: DollarSign, gradient: "from-[#f59e0b] to-[#d97706]" },
        ].map((stat, i) => (
          <div key={i} className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-5 text-white relative overflow-hidden shadow-lg`}>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
            <stat.icon className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm opacity-80">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Admin Actions Guide */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
        <h4 className="text-sm font-semibold text-[#10b981] mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4" /> Admin Actions (Controls Only - No Manual Review)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {adminActions.map((item, i) => (
            <div 
              key={i} 
              className="flex items-center gap-3 p-3 rounded-xl bg-[#0f1419] border border-[#2a3a4d] hover:border-[#3a4a5d] transition-all cursor-pointer group"
            >
              <div 
                className="p-2.5 rounded-lg group-hover:scale-110 transition-all" 
                style={{ backgroundColor: `${item.color}20`, color: item.color }}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-white text-sm font-medium block">{item.label}</span>
                <span className="text-[#6b7280] text-xs">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Users Table */}
      <Card className="bg-[#1a2332] border-[#2a3a4d]">
        <CardHeader className="border-b border-[#2a3a4d] bg-gradient-to-r from-[#f59e0b]/20 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#f59e0b] flex items-center gap-2">
              <Crown className="w-5 h-5" /> Premium Users & Milestones
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
              <Input 
                placeholder="Search user..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-48 bg-[#0f1419] border-[#2a3a4d] text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f1419]">
                <tr>
                  {["User", "Plan", "Progress", "Deposit", "Withdraw", "Reward", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-[#10b981] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a3a4d]">
                {isLoading ? (
                  <tr><td colSpan={8} className="text-center py-8 text-[#6b7280]">Loading...</td></tr>
                ) : filteredUsers?.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-[#6b7280]">No premium users found</td></tr>
                ) : (
                  filteredUsers?.map((user, i) => (
                    <tr key={user.id} className="hover:bg-[#0f1419]/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{user.username}</p>
                            <p className="text-xs text-[#6b7280]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${planColors[user.plan] || planColors["Starter Plan"]}`}>
                          {user.plan || "Starter Plan"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {user.milestone ? (
                          <div className="w-28">
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-[#10b981] font-semibold">
                                {user.milestone.adsClickedCount}/{user.milestone.adsCountLimit}
                              </span>
                              <span className="text-[#6b7280]">
                                {Math.round((user.milestone.adsClickedCount / user.milestone.adsCountLimit) * 100)}%
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-[#2a3a4d] rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full bg-gradient-to-r ${
                                  user.milestone.milestoneStatus === 'completed' ? 'from-[#10b981] to-[#059669]' :
                                  user.milestone.milestoneStatus === 'in_progress' ? 'from-[#3b82f6] to-[#2563eb]' : 
                                  'from-[#f59e0b] to-[#d97706]'
                                }`} 
                                style={{ width: `${(user.milestone.adsClickedCount / user.milestone.adsCountLimit) * 100}%` }} 
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#6b7280] text-xs">No milestone</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {user.milestone ? (
                          user.milestone.depositPaid ? (
                            <span className="flex items-center gap-1.5 text-[#10b981] font-semibold">
                              <Check className="w-4 h-4" /> ₹{user.milestone.depositAmount.toLocaleString()}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[#ef4444] font-semibold">
                              <XCircle className="w-4 h-4" /> ₹{user.milestone.depositAmount.toLocaleString()}
                            </span>
                          )
                        ) : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[#f59e0b] font-semibold">
                          {user.milestone ? `₹${user.milestone.withdrawMilestone.toLocaleString()}` : "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[#10b981] font-semibold">
                          {user.milestone ? `₹${user.milestone.commissionReward.toLocaleString()}` : "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {user.milestone ? (
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                            user.milestone.milestoneStatus === 'completed' ? 'bg-[#10b981]/20 text-[#10b981]' :
                            user.milestone.milestoneStatus === 'in_progress' ? 'bg-[#3b82f6]/20 text-[#3b82f6]' :
                            user.milestone.milestoneStatus === 'pending' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 
                            'bg-[#ef4444]/20 text-[#ef4444]'
                          }`}>
                            {user.milestone.milestoneStatus.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="text-[#6b7280] text-xs">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {[
                            { icon: Target, color: "#8b5cf6", action: () => { setSelectedUser(user); setShowCreateMilestone(true); } },
                            { icon: RotateCcw, color: "#ef4444", action: () => { setSelectedUser(user); setShowResetConfirm(true); } },
                            { icon: Zap, color: "#10b981", action: () => { setSelectedUser(user); setPointsValue(String(user.points)); setShowSetPoints(true); } },
                            { icon: Gift, color: "#f59e0b", action: () => { setSelectedUser(user); setTreasureType(user.treasureType); setShowAddTreasure(true); } },
                            { icon: PiggyBank, color: "#ec4899", action: () => { setSelectedUser(user); setBookingValue(String(user.bookingValue)); setShowAddBooking(true); } },
                            { icon: Edit, color: "#3b82f6", action: () => { setSelectedUser(user); setShowEditUser(true); } },
                          ].map((btn, j) => (
                            <button 
                              key={j} 
                              onClick={btn.action}
                              className="p-2 rounded-lg hover:scale-110 transition-all" 
                              style={{ backgroundColor: `${btn.color}20`, color: btn.color }}
                            >
                              <btn.icon className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Popup Preview */}
      <Card className="bg-[#1a2332] border-[#2a3a4d]">
        <CardHeader>
          <CardTitle className="text-[#10b981] flex items-center gap-2">
            <Eye className="w-5 h-5" /> Customer "Confirm Earn" Popup (After Ad Submission)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-[#0f1419] rounded-xl p-6 max-w-md mx-auto border border-[#2a3a4d] shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-20 h-20 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Check className="w-10 h-10 text-white" />
              </div>
              <p className="text-[#10b981] font-bold text-lg">✅ Your ad is submitted successfully</p>
              <p className="text-[#f59e0b] text-sm mt-2 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" /> Your ad is under system review
              </p>
            </div>
            <div className="space-y-3 border-t border-[#2a3a4d] pt-5">
              <div className="flex justify-between items-center p-3 bg-[#1a2332] rounded-lg">
                <span className="text-[#9ca3af]">Milestone Amount:</span>
                <span className="text-[#ef4444] font-bold text-lg">-5,000 LKR</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#1a2332] rounded-lg">
                <span className="text-[#9ca3af]">Withdraw Milestone (Pending):</span>
                <span className="text-[#f59e0b] font-bold text-lg">2,000 LKR</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-[#2a3a4d] text-center">
              <p className="text-[#6b7280] text-sm">Progress: <span className="text-white font-semibold">7/12</span> → <span className="text-[#10b981] font-semibold">8/12</span></p>
            </div>
            <div className="mt-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg">
              <p className="text-xs text-[#ef4444] text-center">❌ NO "Admin will review" | ❌ NO "Bonus +101.75"</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Milestone Modal */}
      {showCreateMilestone && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] w-full max-w-lg shadow-2xl">
            <div className="px-6 py-4 border-b border-[#2a3a4d] flex items-center justify-between bg-gradient-to-r from-[#8b5cf6]/20 to-transparent">
              <h3 className="text-lg font-semibold text-[#8b5cf6] flex items-center gap-2">
                <Target className="w-5 h-5" /> Create Promotion (Milestone)
              </h3>
              <button onClick={() => { setShowCreateMilestone(false); setSelectedUser(null); }} className="text-[#6b7280] hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {selectedUser && (
                <div className="flex items-center gap-3 p-3 bg-[#0f1419] rounded-lg border border-[#2a3a4d]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-white font-bold">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{selectedUser.username}</p>
                    <p className="text-xs text-[#6b7280]">{selectedUser.email}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#9ca3af]">Ads Count Limit</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 12" 
                    value={milestoneForm.adsCountLimit}
                    onChange={(e) => setMilestoneForm({...milestoneForm, adsCountLimit: e.target.value})}
                    className="mt-2 bg-[#0f1419] border-[#2a3a4d] text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#9ca3af]">Deposit Amount (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 5000" 
                    value={milestoneForm.depositAmount}
                    onChange={(e) => setMilestoneForm({...milestoneForm, depositAmount: e.target.value})}
                    className="mt-2 bg-[#0f1419] border-[#2a3a4d] text-white"
                  />
                  <p className="text-xs text-[#6b7280] mt-1">Shows as NEGATIVE</p>
                </div>
                <div>
                  <Label className="text-[#9ca3af]">Withdraw Milestone (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 2000" 
                    value={milestoneForm.withdrawMilestone}
                    onChange={(e) => setMilestoneForm({...milestoneForm, withdrawMilestone: e.target.value})}
                    className="mt-2 bg-[#0f1419] border-[#2a3a4d] text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#9ca3af]">Commission Reward (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 500" 
                    value={milestoneForm.commissionReward}
                    onChange={(e) => setMilestoneForm({...milestoneForm, commissionReward: e.target.value})}
                    className="mt-2 bg-[#0f1419] border-[#2a3a4d] text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => { setShowCreateMilestone(false); setSelectedUser(null); }} className="flex-1 bg-[#2a3a4d] border-0 text-[#9ca3af]">
                  Cancel
                </Button>
                <Button 
                  onClick={() => selectedUser && createMilestone.mutate({ userId: selectedUser.id, milestone: milestoneForm })}
                  className="flex-1 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed]"
                  disabled={createMilestone.isPending}
                >
                  <Save className="w-4 h-4 mr-2" /> Save Milestone
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirm Modal */}
      {showResetConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-[#2a3a4d] bg-gradient-to-r from-[#ef4444]/20 to-transparent">
              <h3 className="text-lg font-semibold text-[#ef4444] flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Confirm RESET
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[#9ca3af]">Reset milestone for <span className="text-white font-semibold">{selectedUser.username}</span>?</p>
              <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-4">
                <p className="text-[#ef4444] text-sm font-semibold mb-2">This will:</p>
                <ul className="text-sm text-[#9ca3af] space-y-1.5">
                  <li>• adsClickedCount = 0</li>
                  <li>• milestoneStatus = reset</li>
                  <li>• depositPaid = false</li>
                  <li>• Old milestone closed</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setShowResetConfirm(false); setSelectedUser(null); }} className="flex-1 bg-[#2a3a4d] border-0 text-[#9ca3af]">
                  Cancel
                </Button>
                <Button 
                  onClick={() => resetMilestone.mutate(selectedUser.id)}
                  className="flex-1 bg-gradient-to-r from-[#ef4444] to-[#dc2626]"
                  disabled={resetMilestone.isPending}
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> RESET
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set Points Modal */}
      {showSetPoints && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-[#2a3a4d] bg-gradient-to-r from-[#10b981]/20 to-transparent flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#10b981] flex items-center gap-2">
                <Zap className="w-5 h-5" /> SET Points
              </h3>
              <button onClick={() => { setShowSetPoints(false); setSelectedUser(null); }} className="text-[#6b7280] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-[#0f1419] rounded-lg border border-[#2a3a4d]">
                <p className="text-[#6b7280] text-xs">Current Points for {selectedUser.username}</p>
                <p className="text-[#8b5cf6] font-bold text-2xl">{selectedUser.points.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-[#9ca3af]">New Points Value</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 1500" 
                  value={pointsValue}
                  onChange={(e) => setPointsValue(e.target.value)}
                  className="mt-2 bg-[#0f1419] border-[#2a3a4d] text-white"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setShowSetPoints(false); setSelectedUser(null); }} className="flex-1 bg-[#2a3a4d] border-0 text-[#9ca3af]">
                  Cancel
                </Button>
                <Button 
                  onClick={() => updatePoints.mutate({ userId: selectedUser.id, points: Number(pointsValue) })}
                  className="flex-1 bg-gradient-to-r from-[#10b981] to-[#059669]"
                  disabled={updatePoints.isPending}
                >
                  <Save className="w-4 h-4 mr-2" /> Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
