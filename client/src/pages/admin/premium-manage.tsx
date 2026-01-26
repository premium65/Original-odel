import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Crown, Target, RotateCcw, Zap, Gift, PiggyBank, Edit, 
  Check, XCircle, Clock, Save, X, AlertCircle, Search, Eye
} from 'lucide-react';

interface Milestone {
  adsCountLimit: number;
  adsClickedCount: number;
  depositAmount: number;
  depositPaid: boolean;
  withdrawMilestone: number;
  commissionReward: number;
  milestoneStatus: 'pending' | 'in_progress' | 'completed' | 'reset';
}

interface PremiumUser {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  plan?: string;
  milestone?: Milestone;
  points?: number;
  treasureType?: 'premium' | 'normal';
  bookingValue?: number;
  bankDetails?: {
    bankName?: string;
    accountNo?: string;
    branch?: string;
  };
}

export default function PremiumManage() {
  const queryClient = useQueryClient();
  const [showCreateMilestone, setShowCreateMilestone] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSetPoints, setShowSetPoints] = useState(false);
  const [showAddTreasure, setShowAddTreasure] = useState(false);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PremiumUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [milestoneForm, setMilestoneForm] = useState({
    adsCountLimit: '',
    depositAmount: '',
    withdrawMilestone: '',
    commissionReward: ''
  });
  const [pointsForm, setPointsForm] = useState({ points: '' });
  const [treasureForm, setTreasureForm] = useState({ type: 'premium' as 'premium' | 'normal' });
  const [bookingForm, setBookingForm] = useState({ value: '' });

  // Fetch premium users
  const { data: premiumUsers = [], isLoading } = useQuery<PremiumUser[]>({
    queryKey: ['/api/admin/premium-users'],
  });

  // Create milestone mutation
  const createMilestoneMutation = useMutation({
    mutationFn: async (data: { userId: string; milestone: Partial<Milestone> }) => {
      const res = await fetch(`/api/admin/users/${data.userId}/milestone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data.milestone)
      });
      if (!res.ok) throw new Error('Failed to create milestone');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/premium-users'] });
      setShowCreateMilestone(false);
      setSelectedUser(null);
      setMilestoneForm({ adsCountLimit: '', depositAmount: '', withdrawMilestone: '', commissionReward: '' });
    }
  });

  // Reset milestone mutation
  const resetMilestoneMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}/milestone/reset`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to reset milestone');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/premium-users'] });
      setShowResetConfirm(false);
      setSelectedUser(null);
    }
  });

  // Set points mutation
  const setPointsMutation = useMutation({
    mutationFn: async (data: { userId: string; points: number }) => {
      const res = await fetch(`/api/admin/users/${data.userId}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ points: data.points })
      });
      if (!res.ok) throw new Error('Failed to set points');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/premium-users'] });
      setShowSetPoints(false);
      setSelectedUser(null);
      setPointsForm({ points: '' });
    }
  });

  // Filter users by search
  const filteredUsers = premiumUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculations
  const stats = {
    totalPremium: premiumUsers.length,
    activeMilestones: premiumUsers.filter(u => u.milestone?.milestoneStatus === 'in_progress').length,
    completed: premiumUsers.filter(u => u.milestone?.milestoneStatus === 'completed').length,
    totalDeposits: premiumUsers.reduce((sum, u) => sum + (u.milestone?.depositPaid ? u.milestone.depositAmount : 0), 0)
  };

  const handleCreateMilestone = () => {
    if (!selectedUser) return;
    createMilestoneMutation.mutate({
      userId: selectedUser._id,
      milestone: {
        adsCountLimit: parseInt(milestoneForm.adsCountLimit) || 0,
        depositAmount: parseInt(milestoneForm.depositAmount) || 0,
        withdrawMilestone: parseInt(milestoneForm.withdrawMilestone) || 0,
        commissionReward: parseInt(milestoneForm.commissionReward) || 0,
        adsClickedCount: 0,
        depositPaid: false,
        milestoneStatus: 'pending'
      }
    });
  };

  const getPlanColor = (plan?: string) => {
    switch(plan) {
      case 'Gold Plan': return 'bg-[#f59e0b]/20 text-[#f59e0b]';
      case 'Silver Plan': return 'bg-[#9ca3af]/20 text-[#9ca3af]';
      case 'Platinum Plan': return 'bg-[#8b5cf6]/20 text-[#8b5cf6]';
      default: return 'bg-[#3b82f6]/20 text-[#3b82f6]';
    }
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'completed': return 'bg-[#10b981]/20 text-[#10b981]';
      case 'in_progress': return 'bg-[#3b82f6]/20 text-[#3b82f6]';
      case 'pending': return 'bg-[#f59e0b]/20 text-[#f59e0b]';
      case 'reset': return 'bg-[#ef4444]/20 text-[#ef4444]';
      default: return 'bg-[#6b7280]/20 text-[#6b7280]';
    }
  };

  const getProgressColor = (status?: string) => {
    switch(status) {
      case 'completed': return 'from-[#10b981] to-[#059669]';
      case 'in_progress': return 'from-[#3b82f6] to-[#2563eb]';
      default: return 'from-[#f59e0b] to-[#d97706]';
    }
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'from-[#f59e0b] to-[#d97706]',
      'from-[#9ca3af] to-[#6b7280]',
      'from-[#8b5cf6] to-[#7c3aed]',
      'from-[#3b82f6] to-[#2563eb]'
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#10b981] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Crown className="w-7 h-7 text-[#f59e0b]" />
            Premium Manage
            <span className="px-2 py-1 text-xs bg-[#ef4444] text-white rounded-full animate-pulse">NEW</span>
          </h1>
          <p className="text-[#9ca3af] text-sm mt-1">Manage premium users & milestone promotions (System auto-review)</p>
        </div>
        <button 
          onClick={() => setShowCreateMilestone(true)} 
          className="px-5 py-2.5 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all font-semibold"
        >
          <Target className="w-5 h-5" /> Create Promotion
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-2xl p-5 text-white relative overflow-hidden shadow-lg">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
          <Crown className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">{stats.totalPremium}</p>
          <p className="text-sm opacity-80">Premium Users</p>
        </div>
        <div className="bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-2xl p-5 text-white relative overflow-hidden shadow-lg">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
          <Target className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">{stats.activeMilestones}</p>
          <p className="text-sm opacity-80">Active Milestones</p>
        </div>
        <div className="bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-2xl p-5 text-white relative overflow-hidden shadow-lg">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
          <Check className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">{stats.completed}</p>
          <p className="text-sm opacity-80">Completed</p>
        </div>
        <div className="bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-2xl p-5 text-white relative overflow-hidden shadow-lg">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
          <PiggyBank className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">₹{stats.totalDeposits.toLocaleString()}</p>
          <p className="text-sm opacity-80">Total Deposits</p>
        </div>
      </div>

      {/* Admin Actions Guide */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
        <h4 className="text-sm font-semibold text-[#10b981] mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4" /> Admin Actions (Controls Only - No Manual Review)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: Target, color: '#8b5cf6', label: 'Promotions', desc: 'Create Milestone' },
            { icon: RotateCcw, color: '#ef4444', label: 'RESET', desc: 'Restart milestone' },
            { icon: Zap, color: '#10b981', label: 'SET Points', desc: 'Set user points' },
            { icon: Gift, color: '#f59e0b', label: 'ADD Treasure', desc: 'Premium/Normal' },
            { icon: PiggyBank, color: '#ec4899', label: 'ADD Booking', desc: 'Booking value' },
            { icon: Edit, color: '#3b82f6', label: 'EDIT', desc: 'User/Bank details' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#0f1419] border border-[#2a3a4d] hover:border-[#3a4a5d] transition-all cursor-pointer group">
              <div className="p-2.5 rounded-lg group-hover:scale-110 transition-all" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
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
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a3a4d] bg-gradient-to-r from-[#f59e0b]/20 to-transparent flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#f59e0b] flex items-center gap-2">
            <Crown className="w-5 h-5" /> Premium Users & Milestones
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <input 
              type="text" 
              placeholder="Search user..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm placeholder:text-[#6b7280] focus:border-[#f59e0b] focus:outline-none w-48" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f1419]">
              <tr>
                {['User', 'Plan', 'Progress', 'Deposit', 'Withdraw', 'Reward', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-[#10b981] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3a4d]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[#6b7280]">
                    No premium users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, i) => (
                  <tr key={user._id} className="hover:bg-[#0f1419]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(i)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.username}</p>
                          <p className="text-xs text-[#6b7280]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getPlanColor(user.plan)}`}>
                        {user.plan || 'Starter Plan'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-28">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-[#10b981] font-semibold">
                            {user.milestone?.adsClickedCount || 0}/{user.milestone?.adsCountLimit || 0}
                          </span>
                          <span className="text-[#6b7280]">
                            {user.milestone?.adsCountLimit ? Math.round((user.milestone.adsClickedCount / user.milestone.adsCountLimit) * 100) : 0}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-[#2a3a4d] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(user.milestone?.milestoneStatus)}`} 
                            style={{ width: `${user.milestone?.adsCountLimit ? (user.milestone.adsClickedCount / user.milestone.adsCountLimit) * 100 : 0}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {user.milestone?.depositPaid ? (
                        <span className="flex items-center gap-1.5 text-[#10b981] font-semibold">
                          <Check className="w-4 h-4" /> ₹{(user.milestone.depositAmount || 0).toLocaleString()}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[#ef4444] font-semibold">
                          <XCircle className="w-4 h-4" /> ₹{(user.milestone?.depositAmount || 0).toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[#f59e0b] font-semibold">₹{(user.milestone?.withdrawMilestone || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[#10b981] font-semibold">₹{(user.milestone?.commissionReward || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(user.milestone?.milestoneStatus)}`}>
                        {(user.milestone?.milestoneStatus || 'none').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setSelectedUser(user); setShowCreateMilestone(true); }} className="p-2 rounded-lg hover:scale-110 transition-all bg-[#8b5cf6]/20 text-[#8b5cf6]" title="Create Promotion">
                          <Target className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelectedUser(user); setShowResetConfirm(true); }} className="p-2 rounded-lg hover:scale-110 transition-all bg-[#ef4444]/20 text-[#ef4444]" title="RESET">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelectedUser(user); setPointsForm({ points: String(user.points || 0) }); setShowSetPoints(true); }} className="p-2 rounded-lg hover:scale-110 transition-all bg-[#10b981]/20 text-[#10b981]" title="SET Points">
                          <Zap className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelectedUser(user); setShowAddTreasure(true); }} className="p-2 rounded-lg hover:scale-110 transition-all bg-[#f59e0b]/20 text-[#f59e0b]" title="Treasure">
                          <Gift className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelectedUser(user); setShowAddBooking(true); }} className="p-2 rounded-lg hover:scale-110 transition-all bg-[#ec4899]/20 text-[#ec4899]" title="Booking">
                          <PiggyBank className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelectedUser(user); setShowEditUser(true); }} className="p-2 rounded-lg hover:scale-110 transition-all bg-[#3b82f6]/20 text-[#3b82f6]" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Popup Preview */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-6">
        <h3 className="text-lg font-semibold text-[#10b981] mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" /> Customer "Confirm Earn" Popup (After Ad Submission)
        </h3>
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
              <span className="text-[#9ca3af]">Withdraw Milestone:</span>
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
      </div>

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
                  <label className="block text-sm font-medium text-[#9ca3af] mb-2">Ads Count Limit</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 12" 
                    value={milestoneForm.adsCountLimit}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, adsCountLimit: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white placeholder:text-[#6b7280] focus:border-[#8b5cf6] focus:outline-none" 
                  />
                  <p className="text-xs text-[#6b7280] mt-1">Booking Count → Ads Limit</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9ca3af] mb-2">Deposit Amount (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5000" 
                    value={milestoneForm.depositAmount}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, depositAmount: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white placeholder:text-[#6b7280] focus:border-[#8b5cf6] focus:outline-none" 
                  />
                  <p className="text-xs text-[#6b7280] mt-1">Shows as NEGATIVE to user</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9ca3af] mb-2">Withdraw Milestone (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 2000" 
                    value={milestoneForm.withdrawMilestone}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, withdrawMilestone: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white placeholder:text-[#6b7280] focus:border-[#8b5cf6] focus:outline-none" 
                  />
                  <p className="text-xs text-[#6b7280] mt-1">Pending Amount</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9ca3af] mb-2">Commission Reward (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 500" 
                    value={milestoneForm.commissionReward}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, commissionReward: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white placeholder:text-[#6b7280] focus:border-[#8b5cf6] focus:outline-none" 
                  />
                  <p className="text-xs text-[#6b7280] mt-1">Milestone Reward</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setShowCreateMilestone(false); setSelectedUser(null); }} 
                  className="flex-1 px-4 py-3 bg-[#2a3a4d] text-[#9ca3af] rounded-lg font-medium hover:bg-[#3a4a5d] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateMilestone}
                  disabled={createMilestoneMutation.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {createMilestoneMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Milestone
                    </>
                  )}
                </button>
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
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#ef4444]" /> adsClickedCount = 0</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#ef4444]" /> milestoneStatus = reset</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#ef4444]" /> depositPaid = false</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#ef4444]" /> Old milestone closed</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowResetConfirm(false); setSelectedUser(null); }} 
                  className="flex-1 px-4 py-3 bg-[#2a3a4d] text-[#9ca3af] rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => resetMilestoneMutation.mutate(selectedUser._id)}
                  disabled={resetMilestoneMutation.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resetMilestoneMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" /> RESET
                    </>
                  )}
                </button>
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
                <p className="text-[#8b5cf6] font-bold text-2xl">{(selectedUser.points || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9ca3af] mb-2">New Points Value</label>
                <input 
                  type="number" 
                  placeholder="e.g. 1500" 
                  value={pointsForm.points}
                  onChange={(e) => setPointsForm({ points: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none" 
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowSetPoints(false); setSelectedUser(null); }} className="flex-1 px-4 py-3 bg-[#2a3a4d] text-[#9ca3af] rounded-lg font-medium">Cancel</button>
                <button 
                  onClick={() => setPointsMutation.mutate({ userId: selectedUser._id, points: parseInt(pointsForm.points) || 0 })}
                  disabled={setPointsMutation.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {setPointsMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
