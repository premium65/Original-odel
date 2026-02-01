import { useState } from "react";
import { Gem, Save, Plus, Trash2, Crown, Star, Zap } from "lucide-react";

export default function Premium() {
  const [plans, setPlans] = useState([
    { id: 1, name: "Bronze", price: 1000, duration: 30, benefits: ["2x Ad Rewards", "Priority Support"], color: "#cd7f32", enabled: true },
    { id: 2, name: "Silver", price: 2500, duration: 30, benefits: ["3x Ad Rewards", "Priority Support", "Exclusive Ads"], color: "#c0c0c0", enabled: true },
    { id: 3, name: "Gold", price: 5000, duration: 30, benefits: ["5x Ad Rewards", "VIP Support", "Exclusive Ads", "Early Access"], color: "#ffd700", enabled: true },
  ]);

  const [settings, setSettings] = useState({
    enablePremium: true,
    currency: "LKR",
    trialDays: 7,
    showBadges: true,
  });

  const handleSave = () => alert("Premium settings saved!");

  const addPlan = () => {
    setPlans([...plans, { id: Date.now(), name: "New Plan", price: 1000, duration: 30, benefits: ["Benefit 1"], color: "#6b7280", enabled: true }]);
  };

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
          <button onClick={handleSave} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
            <Save className="h-5 w-5" /> Save
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold flex items-center gap-2"><Zap className="h-5 w-5 text-[#f59e0b]" /> General Settings</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <span className="text-[#9ca3af]">Enable Premium</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.enablePremium} onChange={(e) => setSettings({...settings, enablePremium: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div className="p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <label className="block text-xs text-[#6b7280] mb-2">Currency</label>
              <select value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white outline-none">
                <option value="LKR">LKR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <label className="block text-xs text-[#6b7280] mb-2">Trial Days</label>
              <input type="number" value={settings.trialDays} onChange={(e) => setSettings({...settings, trialDays: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white outline-none" />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <span className="text-[#9ca3af]">Show Badges</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.showBadges} onChange={(e) => setSettings({...settings, showBadges: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] overflow-hidden">
            <div className="p-4 border-b border-[#2a3a4d]" style={{ background: `linear-gradient(135deg, ${plan.color}20, transparent)` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${plan.color}30` }}>
                    <Crown className="h-5 w-5" style={{ color: plan.color }} />
                  </div>
                  <input type="text" value={plan.name} onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {...p, name: e.target.value} : p))} className="bg-transparent text-white font-bold text-lg outline-none border-b border-transparent focus:border-white" />
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={plan.enabled} onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {...p, enabled: e.target.checked} : p))} className="sr-only peer" />
                  <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1">Price ({settings.currency})</label>
                  <input type="number" value={plan.price} onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {...p, price: parseInt(e.target.value) || 0} : p))} className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1">Duration (days)</label>
                  <input type="number" value={plan.duration} onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {...p, duration: parseInt(e.target.value) || 0} : p))} className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#6b7280] mb-1">Color</label>
                <div className="flex gap-2">
                  <input type="color" value={plan.color} onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {...p, color: e.target.value} : p))} className="w-10 h-10 rounded cursor-pointer border-0" />
                  <input type="text" value={plan.color} onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {...p, color: e.target.value} : p))} className="flex-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#6b7280] mb-2">Benefits</label>
                <div className="space-y-2">
                  {plan.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-[#f59e0b]" />
                      <input type="text" value={benefit} onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {...p, benefits: p.benefits.map((b, j) => j === i ? e.target.value : b)} : p))} className="flex-1 px-2 py-1 bg-[#0f1419] border border-[#2a3a4d] rounded text-white text-sm outline-none" />
                      <button onClick={() => setPlans(plans.map(p => p.id === plan.id ? {...p, benefits: p.benefits.filter((_, j) => j !== i)} : p))} className="text-[#ef4444] hover:text-[#dc2626]">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setPlans(plans.map(p => p.id === plan.id ? {...p, benefits: [...p.benefits, "New Benefit"]} : p))} className="w-full py-2 border border-dashed border-[#2a3a4d] rounded-lg text-[#6b7280] text-sm hover:border-[#10b981] hover:text-[#10b981]">
                    + Add Benefit
                  </button>
                </div>
              </div>
              <button onClick={() => setPlans(plans.filter(p => p.id !== plan.id))} className="w-full py-2 bg-[#ef4444]/20 text-[#ef4444] rounded-lg text-sm hover:bg-[#ef4444]/30">
                Delete Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
