import { useState, useEffect } from "react";
import { Gem, Save, Plus, Trash2, Crown, Star, Zap, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PremiumPlan {
  id: number;
  name: string;
  description?: string;
  price: string;
  currency: string;
  totalAds: number;
  rewardPerAd: string;
  totalReward: string;
  commission: string;
  welcomeBonus: string;
  features: string[] | null;
  isActive: boolean;
  sortOrder: number;
}

export default function Premium() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Map<number, Partial<PremiumPlan>>>(new Map());
  const [newPlans, setNewPlans] = useState<PremiumPlan[]>([]);

  const { data: plansData, isLoading } = useQuery({
    queryKey: ["premium-plans"],
    queryFn: api.getPremiumPlans,
  });

  useEffect(() => {
    if (plansData) {
      setPlans(plansData.map((p: any) => ({
        ...p,
        features: p.features || [],
      })));
    }
  }, [plansData]);

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createPremiumPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium-plans"] });
      setNewPlans([]);
      toast({ title: "Plan created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create plan", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updatePremiumPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium-plans"] });
      toast({ title: "Plan updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update plan", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deletePremiumPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium-plans"] });
      toast({ title: "Plan deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete plan", variant: "destructive" });
    },
  });

  const handleSave = async () => {
    // Save new plans
    for (const plan of newPlans) {
      await createMutation.mutateAsync({
        name: plan.name,
        description: plan.description || "",
        price: plan.price,
        currency: plan.currency || "LKR",
        totalAds: plan.totalAds || 28,
        rewardPerAd: plan.rewardPerAd || "101.75",
        totalReward: plan.totalReward || "2849.00",
        commission: plan.commission || "0.00",
        welcomeBonus: plan.welcomeBonus || "25000.00",
        features: plan.features || [],
        isActive: plan.isActive,
        sortOrder: plan.sortOrder || 0,
      });
    }

    // Save updated plans
    for (const [id, changes] of pendingChanges) {
      await updateMutation.mutateAsync({ id, data: changes });
    }

    setPendingChanges(new Map());
  };

  const updatePlan = (id: number, updates: Partial<PremiumPlan>) => {
    // Check if this is a new plan (negative ID)
    if (id < 0) {
      setNewPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } else {
      setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      setPendingChanges(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(id) || {};
        newMap.set(id, { ...existing, ...updates });
        return newMap;
      });
    }
  };

  const addPlan = () => {
    const newPlan: PremiumPlan = {
      id: -Date.now(), // Negative ID for new plans
      name: "New Plan",
      description: "",
      price: "1000.00",
      currency: "LKR",
      totalAds: 28,
      rewardPerAd: "101.75",
      totalReward: "2849.00",
      commission: "0.00",
      welcomeBonus: "25000.00",
      features: ["Benefit 1"],
      isActive: true,
      sortOrder: plans.length + newPlans.length,
    };
    setNewPlans([...newPlans, newPlan]);
  };

  const deletePlan = (id: number) => {
    if (id < 0) {
      setNewPlans(prev => prev.filter(p => p.id !== id));
    } else {
      deleteMutation.mutate(id);
    }
  };

  const addBenefit = (planId: number) => {
    const plan = [...plans, ...newPlans].find(p => p.id === planId);
    if (plan) {
      const newFeatures = [...(plan.features || []), "New Benefit"];
      updatePlan(planId, { features: newFeatures });
    }
  };

  const removeBenefit = (planId: number, index: number) => {
    const plan = [...plans, ...newPlans].find(p => p.id === planId);
    if (plan && plan.features) {
      const newFeatures = plan.features.filter((_, i) => i !== index);
      updatePlan(planId, { features: newFeatures });
    }
  };

  const updateBenefit = (planId: number, index: number, value: string) => {
    const plan = [...plans, ...newPlans].find(p => p.id === planId);
    if (plan && plan.features) {
      const newFeatures = plan.features.map((f, i) => i === index ? value : f);
      updatePlan(planId, { features: newFeatures });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const allPlans = [...plans, ...newPlans];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#f59e0b]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#eab308] flex items-center justify-center">
            <Gem className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Premium Plans</h1>
            <p className="text-[#9ca3af]">Manage premium subscription plans</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={addPlan} className="px-5 py-2.5 bg-[#3b82f6] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
            <Plus className="h-5 w-5" /> Add Plan
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || (pendingChanges.size === 0 && newPlans.length === 0)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold flex items-center gap-2"><Zap className="h-5 w-5 text-[#f59e0b]" /> Plan Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <p className="text-[#6b7280] text-sm">Total Plans</p>
              <p className="text-2xl font-bold text-white">{allPlans.length}</p>
            </div>
            <div className="p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <p className="text-[#6b7280] text-sm">Active Plans</p>
              <p className="text-2xl font-bold text-[#10b981]">{allPlans.filter(p => p.isActive).length}</p>
            </div>
            <div className="p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <p className="text-[#6b7280] text-sm">Unsaved Changes</p>
              <p className="text-2xl font-bold text-[#f59e0b]">{pendingChanges.size + newPlans.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      {allPlans.length === 0 ? (
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-12 text-center">
          <Gem className="h-12 w-12 text-[#6b7280] mx-auto mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">No Premium Plans</h3>
          <p className="text-[#9ca3af] mb-4">Create your first premium plan to get started.</p>
          <button onClick={addPlan} className="px-5 py-2.5 bg-[#3b82f6] text-white font-semibold rounded-xl inline-flex items-center gap-2 hover:opacity-90">
            <Plus className="h-5 w-5" /> Add Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPlans.map((plan) => (
            <div key={plan.id} className={`bg-[#1a2332] rounded-2xl border ${plan.id < 0 ? 'border-[#f59e0b]' : 'border-[#2a3a4d]'} overflow-hidden`}>
              <div className="p-4 border-b border-[#2a3a4d] bg-gradient-to-r from-[#f59e0b]/20 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#f59e0b]/30">
                      <Crown className="h-5 w-5 text-[#f59e0b]" />
                    </div>
                    <input
                      type="text"
                      value={plan.name}
                      onChange={(e) => updatePlan(plan.id, { name: e.target.value })}
                      className="bg-transparent text-white font-bold text-lg outline-none border-b border-transparent focus:border-white"
                    />
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={plan.isActive}
                      onChange={(e) => updatePlan(plan.id, { isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
                {plan.id < 0 && (
                  <span className="text-xs text-[#f59e0b] mt-2 block">Unsaved - click Save to create</span>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">Price (LKR)</label>
                    <input
                      type="text"
                      value={plan.price}
                      onChange={(e) => updatePlan(plan.id, { price: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">Total Ads</label>
                    <input
                      type="number"
                      value={plan.totalAds}
                      onChange={(e) => updatePlan(plan.id, { totalAds: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">Reward Per Ad</label>
                    <input
                      type="text"
                      value={plan.rewardPerAd}
                      onChange={(e) => updatePlan(plan.id, { rewardPerAd: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">Total Reward</label>
                    <input
                      type="text"
                      value={plan.totalReward}
                      onChange={(e) => updatePlan(plan.id, { totalReward: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">Welcome Bonus</label>
                    <input
                      type="text"
                      value={plan.welcomeBonus}
                      onChange={(e) => updatePlan(plan.id, { welcomeBonus: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">Commission</label>
                    <input
                      type="text"
                      value={plan.commission}
                      onChange={(e) => updatePlan(plan.id, { commission: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#6b7280] mb-2">Features/Benefits</label>
                  <div className="space-y-2">
                    {(plan.features || []).map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-[#f59e0b]" />
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => updateBenefit(plan.id, i, e.target.value)}
                          className="flex-1 px-2 py-1 bg-[#0f1419] border border-[#2a3a4d] rounded text-white text-sm outline-none"
                        />
                        <button onClick={() => removeBenefit(plan.id, i)} className="text-[#ef4444] hover:text-[#dc2626]">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addBenefit(plan.id)}
                      className="w-full py-2 border border-dashed border-[#2a3a4d] rounded-lg text-[#6b7280] text-sm hover:border-[#10b981] hover:text-[#10b981]"
                    >
                      + Add Benefit
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => deletePlan(plan.id)}
                  disabled={deleteMutation.isPending}
                  className="w-full py-2 bg-[#ef4444]/20 text-[#ef4444] rounded-lg text-sm hover:bg-[#ef4444]/30 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete Plan"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
