import { useState, useEffect } from "react";
import { Percent, Save, Plus, Trash2, Edit, Users, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Commission() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState({
    enableCommission: true,
    defaultPercentage: 10,
    currency: "LKR",
    minWithdrawal: 500,
  });

  const [tiers, setTiers] = useState([
    { id: 1, name: "Bronze", minReferrals: 0, maxReferrals: 10, percentage: 5, enabled: true },
    { id: 2, name: "Silver", minReferrals: 11, maxReferrals: 50, percentage: 10, enabled: true },
    { id: 3, name: "Gold", minReferrals: 51, maxReferrals: 100, percentage: 15, enabled: true },
  ]);

  const { data: contentData, isLoading } = useQuery({
    queryKey: ["admin-content", "commission-settings"],
    queryFn: () => api.getContent("commission-settings"),
  });

  useEffect(() => {
    if (contentData && contentData.length > 0) {
      try {
        const content = contentData[0];
        if (content.metadata) {
          const parsed = typeof content.metadata === 'string' ? JSON.parse(content.metadata) : content.metadata;
          if (parsed.settings) setSettings(prev => ({ ...prev, ...parsed.settings }));
          if (parsed.tiers) setTiers(parsed.tiers);
        }
      } catch (e) {
        console.error("Failed to parse commission settings:", e);
      }
    }
  }, [contentData]);

  const mutation = useMutation({
    mutationFn: (data: any) => api.updateContent("commission-settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content", "commission-settings"] });
      toast({ title: "Commission settings saved!" });
    },
    onError: () => {
      toast({ title: "Failed to save commission settings", variant: "destructive" });
    },
  });

  const handleSave = () => {
    mutation.mutate({
      section: "main",
      title: "Commission Settings",
      content: "",
      metadata: JSON.stringify({ settings, tiers }),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#8b5cf6]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center">
            <Percent className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Commission Settings</h1>
            <p className="text-[#9ca3af]">Manage referral commission rates</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={mutation.isPending} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
          {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
          <div className="px-6 py-4 border-b border-[#2a3a4d]">
            <h3 className="text-white font-semibold flex items-center gap-2"><Edit className="h-5 w-5 text-[#f59e0b]" /> General Settings</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#9ca3af]">Enable Commission</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.enableCommission} onChange={(e) => setSettings({...settings, enableCommission: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Default Commission %</label>
              <input type="number" value={settings.defaultPercentage} onChange={(e) => setSettings({...settings, defaultPercentage: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Min. Withdrawal ({settings.currency})</label>
              <input type="number" value={settings.minWithdrawal} onChange={(e) => setSettings({...settings, minWithdrawal: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
            <h3 className="text-white font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-[#10b981]" /> Commission Tiers</h3>
            <button onClick={() => setTiers([...tiers, { id: Date.now(), name: "New", minReferrals: 0, maxReferrals: 10, percentage: 5, enabled: true }])} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          <div className="p-6 space-y-3">
            {tiers.map((tier) => (
              <div key={tier.id} className="flex items-center gap-3 p-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                <input type="text" value={tier.name} onChange={(e) => setTiers(tiers.map(t => t.id === tier.id ? {...t, name: e.target.value} : t))} className="w-20 px-2 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                <input type="number" value={tier.minReferrals} onChange={(e) => setTiers(tiers.map(t => t.id === tier.id ? {...t, minReferrals: parseInt(e.target.value) || 0} : t))} className="w-14 px-2 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm text-center outline-none" />
                <span className="text-[#6b7280]">-</span>
                <input type="number" value={tier.maxReferrals} onChange={(e) => setTiers(tiers.map(t => t.id === tier.id ? {...t, maxReferrals: parseInt(e.target.value) || 0} : t))} className="w-14 px-2 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm text-center outline-none" />
                <span className="text-[#6b7280] text-xs">refs</span>
                <input type="number" value={tier.percentage} onChange={(e) => setTiers(tiers.map(t => t.id === tier.id ? {...t, percentage: parseInt(e.target.value) || 0} : t))} className="w-14 px-2 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm text-center outline-none" />
                <span className="text-[#10b981] font-bold">%</span>
                <button onClick={() => setTiers(tiers.filter(t => t.id !== tier.id))} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
