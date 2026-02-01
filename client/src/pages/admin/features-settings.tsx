import { useState } from "react";
import { 
  Save, TrendingUp, Target, Gift, Clock, CheckCircle, 
  Lock, DollarSign, Palette, Type, AlertCircle
} from "lucide-react";

interface FeatureCard {
  id: string;
  title: string;
  value: string;
  description: string;
  icon: string;
  borderColor: string;
  valueColor: string;
  enabled: boolean;
}

export default function FeaturesSettings() {
  const [pageTitle, setPageTitle] = useState("Features");
  const [currency, setCurrency] = useState("LKR");
  
  const [cards, setCards] = useState<FeatureCard[]>([
    {
      id: "destination",
      title: "Destination Amount",
      value: "0.00",
      description: "Total earnings from ad clicks with 25,000 first-day bonus",
      icon: "trending-up",
      borderColor: "#ec4899",
      valueColor: "#ec4899",
      enabled: true
    },
    {
      id: "milestone",
      title: "Milestone Amount",
      value: "0.00",
      description: "Available balance for withdrawal",
      icon: "target",
      borderColor: "#06b6d4",
      valueColor: "#06b6d4",
      enabled: true
    },
    {
      id: "reward",
      title: "Milestone Reward",
      value: "0.00",
      description: "Bonus rewards earned from milestones",
      icon: "gift",
      borderColor: "#10b981",
      valueColor: "#ffffff",
      enabled: true
    },
    {
      id: "ongoing",
      title: "Ongoing Milestone",
      value: "0.00",
      description: "Current progress towards next milestone",
      icon: "clock",
      borderColor: "#ec4899",
      valueColor: "#ec4899",
      enabled: true
    },
    {
      id: "completed",
      title: "Ads Completed",
      value: "0",
      description: "Total ads clicked (need 28 to unlock withdrawal)",
      icon: "check-circle",
      borderColor: "#06b6d4",
      valueColor: "#06b6d4",
      enabled: true
    }
  ]);

  const [withdrawal, setWithdrawal] = useState({
    enabled: true,
    title: "Withdrawal",
    lockedText: "Locked",
    unlockedText: "Withdraw Now",
    requiredAds: 28,
    lockedMessage: "{count} more ads needed to unlock",
  });

  const [welcomeBonus, setWelcomeBonus] = useState({
    enabled: true,
    amount: 25000,
    label: "First-day bonus",
  });

  const handleSave = () => {
    alert("Features settings saved successfully!");
  };

  const updateCard = (id: string, field: keyof FeatureCard, value: any) => {
    setCards(cards.map(card => card.id === id ? { ...card, [field]: value } : card));
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      "trending-up": TrendingUp,
      "target": Target,
      "gift": Gift,
      "clock": Clock,
      "check-circle": CheckCircle,
    };
    const IconComponent = icons[iconName] || Target;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ec4899] to-[#be185d] flex items-center justify-center">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Features Page Settings</h1>
            <p className="text-[#9ca3af]">Configure the Features page cards and withdrawal section</p>
          </div>
        </div>
        <button onClick={handleSave} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
          <Save className="h-5 w-5" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Page Settings */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Type className="h-5 w-5 text-[#f59e0b]" /> Page Settings
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Page Title</label>
                  <input type="text" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#f59e0b]" />
                </div>
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none">
                    <option value="LKR">LKR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Bonus */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Gift className="h-5 w-5 text-[#10b981]" /> Welcome Bonus
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#9ca3af]">Enable Welcome Bonus</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={welcomeBonus.enabled} onChange={(e) => setWelcomeBonus({...welcomeBonus, enabled: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Bonus Amount</label>
                  <input type="number" value={welcomeBonus.amount} onChange={(e) => setWelcomeBonus({...welcomeBonus, amount: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Label</label>
                  <input type="text" value={welcomeBonus.label} onChange={(e) => setWelcomeBonus({...welcomeBonus, label: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Section */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#6b7280]" /> Withdrawal Section
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#9ca3af]">Enable Withdrawal Section</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={withdrawal.enabled} onChange={(e) => setWithdrawal({...withdrawal, enabled: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Section Title</label>
                <input type="text" value={withdrawal.title} onChange={(e) => setWithdrawal({...withdrawal, title: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Required Ads to Unlock</label>
                <input type="number" value={withdrawal.requiredAds} onChange={(e) => setWithdrawal({...withdrawal, requiredAds: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Locked Button Text</label>
                  <input type="text" value={withdrawal.lockedText} onChange={(e) => setWithdrawal({...withdrawal, lockedText: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Unlocked Button Text</label>
                  <input type="text" value={withdrawal.unlockedText} onChange={(e) => setWithdrawal({...withdrawal, unlockedText: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Locked Message (use {"{count}"} for remaining)</label>
                <input type="text" value={withdrawal.lockedMessage} onChange={(e) => setWithdrawal({...withdrawal, lockedMessage: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>

              {/* Preview */}
              <div className="bg-[#0f1419] rounded-xl p-4 border border-[#2a3a4d]">
                <p className="text-[#6b7280] text-xs mb-3">Preview:</p>
                <div className="border border-[#2a3a4d] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Lock className="h-5 w-5 text-[#6b7280]" />
                    <span className="text-white font-semibold">{withdrawal.title}</span>
                  </div>
                  <p className="text-[#9ca3af] text-sm mb-3 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {withdrawal.lockedMessage.replace("{count}", withdrawal.requiredAds.toString())}
                  </p>
                  <button className="w-full py-3 bg-[#2a3a4d] text-[#9ca3af] rounded-xl font-semibold">
                    {withdrawal.lockedText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Feature Cards */}
        <div className="space-y-6">
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#f59e0b]" /> Feature Cards
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {cards.map((card) => (
                <div key={card.id} className="bg-[#0f1419] border border-[#2a3a4d] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.borderColor}20`, color: card.borderColor }}>
                        {getIconComponent(card.icon)}
                      </div>
                      <span className="text-white font-semibold">{card.title}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={card.enabled} onChange={(e) => updateCard(card.id, 'enabled', e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-[#6b7280] mb-1">Title</label>
                      <input type="text" value={card.title} onChange={(e) => updateCard(card.id, 'title', e.target.value)} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#6b7280] mb-1">Icon</label>
                      <select value={card.icon} onChange={(e) => updateCard(card.id, 'icon', e.target.value)} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none">
                        <option value="trending-up">📈 Trending Up</option>
                        <option value="target">🎯 Target</option>
                        <option value="gift">🎁 Gift</option>
                        <option value="clock">⏰ Clock</option>
                        <option value="check-circle">✅ Check Circle</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-xs text-[#6b7280] mb-1">Description</label>
                    <input type="text" value={card.description} onChange={(e) => updateCard(card.id, 'description', e.target.value)} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#6b7280] mb-1 flex items-center gap-1">
                        <Palette className="h-3 w-3" /> Border Color
                      </label>
                      <div className="flex gap-2">
                        <input type="color" value={card.borderColor} onChange={(e) => updateCard(card.id, 'borderColor', e.target.value)} className="w-10 h-8 rounded cursor-pointer border-0" />
                        <input type="text" value={card.borderColor} onChange={(e) => updateCard(card.id, 'borderColor', e.target.value)} className="flex-1 px-2 py-1 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-xs font-mono outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-[#6b7280] mb-1 flex items-center gap-1">
                        <Palette className="h-3 w-3" /> Value Color
                      </label>
                      <div className="flex gap-2">
                        <input type="color" value={card.valueColor} onChange={(e) => updateCard(card.id, 'valueColor', e.target.value)} className="w-10 h-8 rounded cursor-pointer border-0" />
                        <input type="text" value={card.valueColor} onChange={(e) => updateCard(card.id, 'valueColor', e.target.value)} className="flex-1 px-2 py-1 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-xs font-mono outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Mini Preview */}
                  <div className="mt-4 pt-4 border-t border-[#2a3a4d]">
                    <p className="text-[#6b7280] text-xs mb-2">Preview:</p>
                    <div className="p-3 rounded-lg border-2" style={{ borderColor: card.borderColor }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm">{card.title}</span>
                        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: `${card.borderColor}20`, color: card.borderColor }}>
                          {getIconComponent(card.icon)}
                        </div>
                      </div>
                      <p className="text-xl font-bold" style={{ color: card.valueColor }}>{currency} {card.value}</p>
                      <p className="text-[#6b7280] text-xs">{card.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
