import { useState, useEffect } from "react";
import {
  BarChart3, Save, DollarSign, Target, Gift, Clock, CheckCircle, Lock,
  TrendingUp, Wallet, Loader2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminFeaturesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Feature Cards Configuration
  const [cards, setCards] = useState({
    destinationAmount: {
      enabled: true,
      title: "Destination Amount",
      description: "Total earnings from ad clicks with 25,000 first-day bonus",
      color: "#ec4899", // pink
      currency: "LKR"
    },
    milestoneAmount: {
      enabled: true,
      title: "Milestone Amount",
      description: "Available balance for withdrawal",
      color: "#06b6d4", // cyan
      currency: "LKR"
    },
    milestoneReward: {
      enabled: true,
      title: "Milestone Reward",
      badgeText: "Milestone Reward",
      description: "Bonus rewards earned from milestones",
      color: "#10b981", // green
      currency: "LKR"
    },
    ongoingMilestone: {
      enabled: true,
      title: "Ongoing Milestone",
      description: "Current progress towards next milestone",
      color: "#ec4899", // pink
      currency: "LKR"
    },
    adsCompleted: {
      enabled: true,
      title: "Ads Completed",
      description: "Total ads clicked (need 28 to unlock withdrawal)",
      color: "#06b6d4", // cyan
      showProgressBar: true
    }
  });

  // Withdrawal Settings
  const [withdrawal, setWithdrawal] = useState({
    enabled: true,
    title: "Withdrawal",
    minAdsRequired: 28,
    lockedMessage: "more ads needed to unlock",
    lockedButtonText: "Locked",
    unlockedButtonText: "Withdraw Now"
  });

  // First Day Bonus
  const [firstDayBonus, setFirstDayBonus] = useState({
    enabled: true,
    amount: 25000,
    currency: "LKR"
  });

  const { data: contentData, isLoading } = useQuery({
    queryKey: ["admin-content", "features-page"],
    queryFn: () => api.getContent("features-page"),
  });

  useEffect(() => {
    if (contentData && contentData.length > 0) {
      try {
        const content = contentData[0];
        if (content.metadata) {
          const parsed = typeof content.metadata === 'string' ? JSON.parse(content.metadata) : content.metadata;
          if (parsed.cards) setCards(prev => ({ ...prev, ...parsed.cards }));
          if (parsed.withdrawal) setWithdrawal(prev => ({ ...prev, ...parsed.withdrawal }));
          if (parsed.firstDayBonus) setFirstDayBonus(prev => ({ ...prev, ...parsed.firstDayBonus }));
        }
      } catch (e) {
        console.error("Failed to parse features page settings:", e);
      }
    }
  }, [contentData]);

  const mutation = useMutation({
    mutationFn: (data: any) => api.updateContent("features-page", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content", "features-page"] });
      toast({ title: "Features page settings saved!" });
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
    },
  });

  const handleSave = () => {
    mutation.mutate({
      section: "main",
      title: "Features Page Settings",
      content: "",
      metadata: JSON.stringify({ cards, withdrawal, firstDayBonus }),
    });
  };

  const updateCard = (cardKey: string, field: string, value: any) => {
    setCards({
      ...cards,
      [cardKey]: {
        ...(cards as any)[cardKey],
        [field]: value
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#ec4899]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ec4899] to-[#be185d] flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Features Page Settings</h1>
            <p className="text-[#9ca3af]">Configure the user features/balances page</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={mutation.isPending} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
          {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save Changes
        </button>
      </div>

      {/* Preview Cards */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6">
        <h3 className="text-white font-semibold mb-4">Live Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Destination Amount */}
          <div className="p-4 bg-[#0f1419] rounded-xl border-2" style={{ borderColor: cards.destinationAmount.color }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{cards.destinationAmount.title}</span>
              <TrendingUp className="h-5 w-5" style={{ color: cards.destinationAmount.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: cards.destinationAmount.color }}>{cards.destinationAmount.currency} 0.00</p>
            <p className="text-[#6b7280] text-xs mt-1">{cards.destinationAmount.description}</p>
          </div>

          {/* Milestone Amount */}
          <div className="p-4 bg-[#0f1419] rounded-xl border-2" style={{ borderColor: cards.milestoneAmount.color }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{cards.milestoneAmount.title}</span>
              <Target className="h-5 w-5" style={{ color: cards.milestoneAmount.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: cards.milestoneAmount.color }}>{cards.milestoneAmount.currency} 0.00</p>
            <p className="text-[#6b7280] text-xs mt-1">{cards.milestoneAmount.description}</p>
          </div>

          {/* Milestone Reward */}
          <div className="p-4 bg-[#0f1419] rounded-xl border-2 border-[#2a3a4d]">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: `${cards.milestoneReward.color}30`, color: cards.milestoneReward.color }}>{cards.milestoneReward.badgeText}</span>
              <Gift className="h-5 w-5 text-[#f59e0b]" />
            </div>
            <p className="text-2xl font-bold text-white">{cards.milestoneReward.currency} 0.00</p>
            <p className="text-[#6b7280] text-xs mt-1">{cards.milestoneReward.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Ongoing Milestone */}
          <div className="p-4 bg-[#0f1419] rounded-xl border-2" style={{ borderColor: cards.ongoingMilestone.color }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{cards.ongoingMilestone.title}</span>
              <Clock className="h-5 w-5" style={{ color: cards.ongoingMilestone.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: cards.ongoingMilestone.color }}>{cards.ongoingMilestone.currency} 0.00</p>
            <p className="text-[#6b7280] text-xs mt-1">{cards.ongoingMilestone.description}</p>
          </div>

          {/* Ads Completed */}
          <div className="p-4 bg-[#0f1419] rounded-xl border-2" style={{ borderColor: cards.adsCompleted.color }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{cards.adsCompleted.title}</span>
              <CheckCircle className="h-5 w-5" style={{ color: cards.adsCompleted.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: cards.adsCompleted.color }}>0</p>
            <p className="text-[#6b7280] text-xs mt-1">{cards.adsCompleted.description}</p>
            {cards.adsCompleted.showProgressBar && <div className="h-2 bg-[#2a3a4d] rounded-full mt-2"><div className="h-full w-0 bg-[#06b6d4] rounded-full"></div></div>}
          </div>
        </div>

        {/* Withdrawal Card */}
        <div className="mt-4 p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
          <div className="flex items-center gap-3 mb-3">
            <Lock className="h-5 w-5 text-[#6b7280]" />
            <span className="text-white font-medium">{withdrawal.title}</span>
          </div>
          <div className="flex items-center gap-2 text-[#6b7280] text-sm mb-3">
            <Lock className="h-4 w-4" />
            <span>{withdrawal.minAdsRequired} {withdrawal.lockedMessage}</span>
          </div>
          <button className="w-full py-3 bg-[#2a3a4d] text-[#6b7280] rounded-xl font-medium">{withdrawal.lockedButtonText}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Destination Amount Settings */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#ec4899]" /> Destination Amount Card
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-[#9ca3af]">Enable Card</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={cards.destinationAmount.enabled} onChange={(e) => updateCard('destinationAmount', 'enabled', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Title</label><input type="text" value={cards.destinationAmount.title} onChange={(e) => updateCard('destinationAmount', 'title', e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Description</label><textarea value={cards.destinationAmount.description} onChange={(e) => updateCard('destinationAmount', 'description', e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none min-h-[60px]" /></div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Border Color</label><div className="flex gap-3"><input type="color" value={cards.destinationAmount.color} onChange={(e) => updateCard('destinationAmount', 'color', e.target.value)} className="w-12 h-10 rounded cursor-pointer" /><input type="text" value={cards.destinationAmount.color} onChange={(e) => updateCard('destinationAmount', 'color', e.target.value)} className="flex-1 px-4 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white font-mono outline-none" /></div></div>
          </div>
        </div>

        {/* Milestone Amount Settings */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-[#06b6d4]" /> Milestone Amount Card
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-[#9ca3af]">Enable Card</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={cards.milestoneAmount.enabled} onChange={(e) => updateCard('milestoneAmount', 'enabled', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Title</label><input type="text" value={cards.milestoneAmount.title} onChange={(e) => updateCard('milestoneAmount', 'title', e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Description</label><textarea value={cards.milestoneAmount.description} onChange={(e) => updateCard('milestoneAmount', 'description', e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none min-h-[60px]" /></div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Border Color</label><div className="flex gap-3"><input type="color" value={cards.milestoneAmount.color} onChange={(e) => updateCard('milestoneAmount', 'color', e.target.value)} className="w-12 h-10 rounded cursor-pointer" /><input type="text" value={cards.milestoneAmount.color} onChange={(e) => updateCard('milestoneAmount', 'color', e.target.value)} className="flex-1 px-4 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white font-mono outline-none" /></div></div>
          </div>
        </div>

        {/* Milestone Reward Settings */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-[#10b981]" /> Milestone Reward Card
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-[#9ca3af]">Enable Card</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={cards.milestoneReward.enabled} onChange={(e) => updateCard('milestoneReward', 'enabled', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Title</label><input type="text" value={cards.milestoneReward.title} onChange={(e) => updateCard('milestoneReward', 'title', e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Badge Text</label><input type="text" value={cards.milestoneReward.badgeText} onChange={(e) => updateCard('milestoneReward', 'badgeText', e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Description</label><textarea value={cards.milestoneReward.description} onChange={(e) => updateCard('milestoneReward', 'description', e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none min-h-[60px]" /></div>
          </div>
        </div>

        {/* Ads Completed Settings */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[#06b6d4]" /> Ads Completed Card
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-[#9ca3af]">Enable Card</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={cards.adsCompleted.enabled} onChange={(e) => updateCard('adsCompleted', 'enabled', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Title</label><input type="text" value={cards.adsCompleted.title} onChange={(e) => updateCard('adsCompleted', 'title', e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Description</label><textarea value={cards.adsCompleted.description} onChange={(e) => updateCard('adsCompleted', 'description', e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none min-h-[60px]" /></div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#9ca3af]">Show Progress Bar</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={cards.adsCompleted.showProgressBar} onChange={(e) => updateCard('adsCompleted', 'showProgressBar', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Withdrawal Settings */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6 lg:col-span-2">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-[#f59e0b]" /> Withdrawal Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div><label className="block text-sm text-[#9ca3af] mb-2">Section Title</label><input type="text" value={withdrawal.title} onChange={(e) => setWithdrawal({...withdrawal, title: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
              <div><label className="block text-sm text-[#9ca3af] mb-2">Minimum Ads Required</label><input type="number" value={withdrawal.minAdsRequired} onChange={(e) => setWithdrawal({...withdrawal, minAdsRequired: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm text-[#9ca3af] mb-2">Locked Message</label><input type="text" value={withdrawal.lockedMessage} onChange={(e) => setWithdrawal({...withdrawal, lockedMessage: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-[#9ca3af] mb-2">Locked Button</label><input type="text" value={withdrawal.lockedButtonText} onChange={(e) => setWithdrawal({...withdrawal, lockedButtonText: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
                <div><label className="block text-sm text-[#9ca3af] mb-2">Unlocked Button</label><input type="text" value={withdrawal.unlockedButtonText} onChange={(e) => setWithdrawal({...withdrawal, unlockedButtonText: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* First Day Bonus */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6 lg:col-span-2">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-[#f59e0b]" /> First Day Bonus
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <span className="text-[#9ca3af]">Enable First Day Bonus</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={firstDayBonus.enabled} onChange={(e) => setFirstDayBonus({...firstDayBonus, enabled: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Bonus Amount</label><input type="number" value={firstDayBonus.amount} onChange={(e) => setFirstDayBonus({...firstDayBonus, amount: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Currency</label><select value={firstDayBonus.currency} onChange={(e) => setFirstDayBonus({...firstDayBonus, currency: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none"><option value="LKR">LKR</option><option value="USD">USD</option></select></div>
          </div>
        </div>
      </div>
    </div>
  );
}
