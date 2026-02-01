import { useState } from "react";
import { 
  Shield, Save, CheckCircle, Star, TrendingUp, Crown, Eye,
  Plus, Trash2, Edit, Award
} from "lucide-react";

interface LoyaltyLevel {
  id: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  icon: string;
}

export default function AdminStatusPage() {
  // Account Status Card
  const [accountStatus, setAccountStatus] = useState({
    enabled: true,
    title: "Account Status",
    activeLabel: "Active",
    activeMessage: "Your account is active. You can watch ads and earn money.",
    activeColor: "#10b981",
    inactiveLabel: "Inactive",
    inactiveMessage: "Your account is currently inactive.",
    inactiveColor: "#ef4444",
    borderColor: "#10b981"
  });

  // Loyalty Points Card
  const [loyaltyPoints, setLoyaltyPoints] = useState({
    enabled: true,
    title: "Loyalty Points",
    maxPoints: 100,
    showProgressBar: true,
    progressBarColor: "#f59e0b",
    borderColor: "#f59e0b",
    pointsLabel: "points",
    maxLabel: "points to max"
  });

  // Loyalty Levels
  const [loyaltyLevels, setLoyaltyLevels] = useState<LoyaltyLevel[]>([
    { id: 1, name: "Starter Level", minPoints: 0, maxPoints: 99, color: "#f59e0b", icon: "crown" },
    { id: 2, name: "Bronze Level", minPoints: 100, maxPoints: 249, color: "#cd7f32", icon: "award" },
    { id: 3, name: "Silver Level", minPoints: 250, maxPoints: 499, color: "#c0c0c0", icon: "award" },
    { id: 4, name: "Gold Level", minPoints: 500, maxPoints: 999, color: "#ffd700", icon: "crown" },
    { id: 5, name: "Platinum Level", minPoints: 1000, maxPoints: 9999, color: "#e5e4e2", icon: "star" },
  ]);

  // Activity Stats Card
  const [activityStats, setActivityStats] = useState({
    enabled: true,
    title: "Activity Stats",
    borderColor: "#8b5cf6",
    stats: [
      { id: 1, label: "Ads Completed", color: "#f59e0b", enabled: true },
      { id: 2, label: "Weeks Active", color: "#8b5cf6", enabled: true }
    ]
  });

  const [editingLevel, setEditingLevel] = useState<LoyaltyLevel | null>(null);

  const addLevel = () => {
    const newLevel: LoyaltyLevel = {
      id: Date.now(),
      name: "New Level",
      minPoints: 0,
      maxPoints: 100,
      color: "#6b7280",
      icon: "award"
    };
    setLoyaltyLevels([...loyaltyLevels, newLevel]);
    setEditingLevel(newLevel);
  };

  const deleteLevel = (id: number) => {
    if (!confirm("Are you sure you want to delete this level?")) return;
    setLoyaltyLevels(loyaltyLevels.filter(l => l.id !== id));
    if (editingLevel?.id === id) setEditingLevel(null);
  };

  const saveLevel = () => {
    if (editingLevel) {
      setLoyaltyLevels(loyaltyLevels.map(l => l.id === editingLevel.id ? editingLevel : l));
    }
    setEditingLevel(null);
  };

  const updateStat = (id: number, field: string, value: any) => {
    setActivityStats({
      ...activityStats,
      stats: activityStats.stats.map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Status Page Settings</h1>
            <p className="text-[#9ca3af]">Configure user status, loyalty points, and activity</p>
          </div>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
          <Save className="h-5 w-5" /> Save All Changes
        </button>
      </div>

      {/* Preview */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-[#3b82f6]" /> Live Preview
        </h3>
        
        <div className="space-y-4">
          {/* Account Status Preview */}
          {accountStatus.enabled && (
            <div className="p-5 bg-[#0f1419] rounded-xl border-2" style={{ borderColor: accountStatus.borderColor }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">{accountStatus.title}</span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accountStatus.activeColor}20` }}>
                  <CheckCircle className="h-5 w-5" style={{ color: accountStatus.activeColor }} />
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg text-sm font-semibold text-white mb-2 inline-block" style={{ backgroundColor: accountStatus.activeColor }}>{accountStatus.activeLabel}</span>
              <p className="text-[#9ca3af] text-sm mt-2">{accountStatus.activeMessage}</p>
            </div>
          )}

          {/* Loyalty Points Preview */}
          {loyaltyPoints.enabled && (
            <div className="p-5 bg-[#0f1419] rounded-xl border-2" style={{ borderColor: loyaltyPoints.borderColor }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">{loyaltyPoints.title}</span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${loyaltyPoints.progressBarColor}20` }}>
                  <Star className="h-5 w-5" style={{ color: loyaltyPoints.progressBarColor }} />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold" style={{ color: loyaltyPoints.progressBarColor }}>0</span>
                <span className="text-[#6b7280]">/ {loyaltyPoints.maxPoints} {loyaltyPoints.pointsLabel}</span>
              </div>
              {loyaltyPoints.showProgressBar && (
                <div className="h-2 bg-[#2a3a4d] rounded-full mb-3">
                  <div className="h-full w-0 rounded-full" style={{ backgroundColor: loyaltyPoints.progressBarColor }}></div>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-[#f59e0b]" />
                  <span className="text-white">{loyaltyLevels[0]?.name || "Starter Level"}</span>
                </div>
                <span className="text-[#6b7280]">{loyaltyPoints.maxPoints} {loyaltyPoints.maxLabel}</span>
              </div>
            </div>
          )}

          {/* Activity Stats Preview */}
          {activityStats.enabled && (
            <div className="p-5 bg-[#0f1419] rounded-xl border-2" style={{ borderColor: activityStats.borderColor }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium">{activityStats.title}</span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${activityStats.borderColor}20` }}>
                  <TrendingUp className="h-5 w-5" style={{ color: activityStats.borderColor }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {activityStats.stats.filter(s => s.enabled).map(stat => (
                  <div key={stat.id} className="p-3 bg-[#1a2332] rounded-lg">
                    <p className="text-2xl font-bold" style={{ color: stat.color }}>0</p>
                    <p className="text-[#6b7280] text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Status Settings */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[#10b981]" /> Account Status Card
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2"><span className="text-[#9ca3af]">Enable Card</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={accountStatus.enabled} onChange={(e) => setAccountStatus({...accountStatus, enabled: e.target.checked})} className="sr-only peer" /><div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label></div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Card Title</label><input type="text" value={accountStatus.title} onChange={(e) => setAccountStatus({...accountStatus, title: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-[#9ca3af] mb-2">Active Label</label><input type="text" value={accountStatus.activeLabel} onChange={(e) => setAccountStatus({...accountStatus, activeLabel: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
              <div><label className="block text-sm text-[#9ca3af] mb-2">Active Color</label><div className="flex gap-2"><input type="color" value={accountStatus.activeColor} onChange={(e) => setAccountStatus({...accountStatus, activeColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer" /><input type="text" value={accountStatus.activeColor} onChange={(e) => setAccountStatus({...accountStatus, activeColor: e.target.value})} className="flex-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none" /></div></div>
            </div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Active Message</label><textarea value={accountStatus.activeMessage} onChange={(e) => setAccountStatus({...accountStatus, activeMessage: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none min-h-[60px]" /></div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Border Color</label><div className="flex gap-2"><input type="color" value={accountStatus.borderColor} onChange={(e) => setAccountStatus({...accountStatus, borderColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer" /><input type="text" value={accountStatus.borderColor} onChange={(e) => setAccountStatus({...accountStatus, borderColor: e.target.value})} className="flex-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none" /></div></div>
          </div>
        </div>

        {/* Loyalty Points Settings */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-[#f59e0b]" /> Loyalty Points Card
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2"><span className="text-[#9ca3af]">Enable Card</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={loyaltyPoints.enabled} onChange={(e) => setLoyaltyPoints({...loyaltyPoints, enabled: e.target.checked})} className="sr-only peer" /><div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label></div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Card Title</label><input type="text" value={loyaltyPoints.title} onChange={(e) => setLoyaltyPoints({...loyaltyPoints, title: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-[#9ca3af] mb-2">Max Points</label><input type="number" value={loyaltyPoints.maxPoints} onChange={(e) => setLoyaltyPoints({...loyaltyPoints, maxPoints: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
              <div><label className="block text-sm text-[#9ca3af] mb-2">Progress Color</label><div className="flex gap-2"><input type="color" value={loyaltyPoints.progressBarColor} onChange={(e) => setLoyaltyPoints({...loyaltyPoints, progressBarColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer" /><input type="text" value={loyaltyPoints.progressBarColor} onChange={(e) => setLoyaltyPoints({...loyaltyPoints, progressBarColor: e.target.value})} className="flex-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none" /></div></div>
            </div>
            <div className="flex items-center justify-between py-2"><span className="text-[#9ca3af]">Show Progress Bar</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={loyaltyPoints.showProgressBar} onChange={(e) => setLoyaltyPoints({...loyaltyPoints, showProgressBar: e.target.checked})} className="sr-only peer" /><div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-[#9ca3af] mb-2">Points Label</label><input type="text" value={loyaltyPoints.pointsLabel} onChange={(e) => setLoyaltyPoints({...loyaltyPoints, pointsLabel: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
              <div><label className="block text-sm text-[#9ca3af] mb-2">Max Label</label><input type="text" value={loyaltyPoints.maxLabel} onChange={(e) => setLoyaltyPoints({...loyaltyPoints, maxLabel: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
            </div>
          </div>
        </div>

        {/* Activity Stats Settings */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#8b5cf6]" /> Activity Stats Card
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2"><span className="text-[#9ca3af]">Enable Card</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={activityStats.enabled} onChange={(e) => setActivityStats({...activityStats, enabled: e.target.checked})} className="sr-only peer" /><div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label></div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Card Title</label><input type="text" value={activityStats.title} onChange={(e) => setActivityStats({...activityStats, title: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Border Color</label><div className="flex gap-2"><input type="color" value={activityStats.borderColor} onChange={(e) => setActivityStats({...activityStats, borderColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer" /><input type="text" value={activityStats.borderColor} onChange={(e) => setActivityStats({...activityStats, borderColor: e.target.value})} className="flex-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none" /></div></div>
            <div className="space-y-3 mt-4">
              {activityStats.stats.map(stat => (
                <div key={stat.id} className="flex items-center gap-3 p-3 bg-[#0f1419] rounded-lg border border-[#2a3a4d]">
                  <input type="text" value={stat.label} onChange={(e) => updateStat(stat.id, 'label', e.target.value)} className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded text-white text-sm outline-none" />
                  <input type="color" value={stat.color} onChange={(e) => updateStat(stat.id, 'color', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={stat.enabled} onChange={(e) => updateStat(stat.id, 'enabled', e.target.checked)} className="sr-only peer" /><div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div></label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Level Form */}
        {editingLevel && (
          <div className="bg-[#1a2332] rounded-2xl border border-[#10b981] p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Edit className="h-5 w-5 text-[#10b981]" /> Edit Level
            </h3>
            <div className="space-y-4">
              <div><label className="block text-sm text-[#9ca3af] mb-2">Level Name</label><input type="text" value={editingLevel.name} onChange={(e) => setEditingLevel({...editingLevel, name: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-[#9ca3af] mb-2">Min Points</label><input type="number" value={editingLevel.minPoints} onChange={(e) => setEditingLevel({...editingLevel, minPoints: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
                <div><label className="block text-sm text-[#9ca3af] mb-2">Max Points</label><input type="number" value={editingLevel.maxPoints} onChange={(e) => setEditingLevel({...editingLevel, maxPoints: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
              </div>
              <div><label className="block text-sm text-[#9ca3af] mb-2">Level Color</label><div className="flex gap-2"><input type="color" value={editingLevel.color} onChange={(e) => setEditingLevel({...editingLevel, color: e.target.value})} className="w-10 h-10 rounded cursor-pointer" /><input type="text" value={editingLevel.color} onChange={(e) => setEditingLevel({...editingLevel, color: e.target.value})} className="flex-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none" /></div></div>
              <div className="flex gap-3">
                <button onClick={saveLevel} className="flex-1 py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center justify-center gap-2"><Save className="h-5 w-5" /> Save Level</button>
                <button onClick={() => setEditingLevel(null)} className="px-6 py-3 bg-transparent border border-[#2a3a4d] text-[#9ca3af] rounded-xl">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loyalty Levels */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-[#f59e0b]" /> Loyalty Levels ({loyaltyLevels.length})
          </h3>
          <button onClick={addLevel} className="px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-xl text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Level
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loyaltyLevels.map(level => (
            <div key={level.id} className="p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5" style={{ color: level.color }} />
                  <span className="text-white font-semibold">{level.name}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingLevel(level)} className="w-7 h-7 bg-[#3b82f6]/20 text-[#3b82f6] rounded flex items-center justify-center"><Edit className="h-3 w-3" /></button>
                  <button onClick={() => deleteLevel(level.id)} className="w-7 h-7 bg-[#ef4444]/20 text-[#ef4444] rounded flex items-center justify-center"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b7280]">{level.minPoints} - {level.maxPoints} pts</span>
                <span className="w-4 h-4 rounded" style={{ backgroundColor: level.color }}></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
