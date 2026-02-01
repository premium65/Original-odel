import { useState, useEffect } from "react";
import { Gauge, Save, Type, Target, Video, Sparkles, Monitor, DollarSign, Coins, Zap, Plus, Trash2, GripVertical, Eye, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ContentDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState({
    welcomeText: "Hi",
    showUserName: true,
    showBalanceCard: true,
    balanceLabel: "Balance",
    currencySymbol: "LKR",
    showChangeIndicator: true,
    showAdsProgress: true,
    adsProgressLabel: "Ads Progress",
    totalAdsRequired: 28,
    showAccountStatus: true,
    accountStatusLabel: "Account Status",
    showSeeAllButton: true,
    seeAllButtonText: "See all",
    showVideo: true,
    videoUrl: "",
    videoTitle: "Watch & Earn",
    videoSubtitle: "ODELADS",
    showLiveBadge: true,
    autoplay: false,
    showMarquee: true,
    marqueeText: "EARN MORE TODAY >>> CLICK ADS & WIN >>> RATING ADS >>> EARN MORE TODAY",
    marqueeSpeed: 50,
    showDollarStat: true,
    showCoinsStat: true,
    showLightningStat: true,
  });

  const [tabs, setTabs] = useState([
    { id: "exclusives", name: "Exclusives", enabled: true, order: 1 },
    { id: "ads-hub", name: "Ads Hub", enabled: true, order: 2 },
    { id: "rewards", name: "Rewards", enabled: true, order: 3 },
    { id: "events", name: "Events", enabled: true, order: 4 },
    { id: "promos", name: "Promos", enabled: true, order: 5 },
    { id: "status", name: "Status", enabled: true, order: 6 },
  ]);

  const [badges, setBadges] = useState([
    { id: 1, name: "Active", color: "#10b981", enabled: true },
    { id: 2, name: "Hot", color: "#ef4444", enabled: true },
    { id: 3, name: "New", color: "#3b82f6", enabled: true },
    { id: 4, name: "Premium", color: "#8b5cf6", enabled: true },
  ]);

  const { data: contentData, isLoading } = useQuery({
    queryKey: ["admin-content", "dashboard"],
    queryFn: () => api.getContent("dashboard"),
  });

  useEffect(() => {
    if (contentData && contentData.length > 0) {
      try {
        const content = contentData[0];
        if (content.metadata) {
          const parsed = typeof content.metadata === 'string' ? JSON.parse(content.metadata) : content.metadata;
          if (parsed.settings) setSettings(prev => ({ ...prev, ...parsed.settings }));
          if (parsed.tabs) setTabs(parsed.tabs);
          if (parsed.badges) setBadges(parsed.badges);
        }
      } catch (e) {
        console.error("Failed to parse dashboard content:", e);
      }
    }
  }, [contentData]);

  const mutation = useMutation({
    mutationFn: (data: any) => api.updateContent("dashboard", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content", "dashboard"] });
      toast({ title: "Dashboard settings saved!" });
    },
    onError: () => {
      toast({ title: "Failed to save dashboard settings", variant: "destructive" });
    },
  });

  const handleSave = () => {
    mutation.mutate({
      section: "main",
      title: "Dashboard Settings",
      content: "",
      metadata: JSON.stringify({ settings, tabs, badges }),
    });
  };

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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center">
            <Gauge className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Page Settings</h1>
            <p className="text-[#9ca3af]">Configure user dashboard appearance</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={mutation.isPending} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
          {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2"><Type className="h-5 w-5 text-[#f59e0b]" /> Welcome Section</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Welcome Text</label>
                <input type="text" value={settings.welcomeText} onChange={(e) => setSettings({...settings, welcomeText: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#f59e0b]" />
              </div>
              <div className="flex items-center justify-between py-3 border-t border-[#2a3a4d]">
                <span className="text-[#9ca3af]">Show User Name</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.showUserName} onChange={(e) => setSettings({...settings, showUserName: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              <div className="bg-[#0f1419] rounded-xl p-4 border border-[#2a3a4d]">
                <p className="text-[#6b7280] text-xs mb-2">Preview:</p>
                <h2 className="text-2xl font-bold italic text-white">{settings.welcomeText}{settings.showUserName ? " Demo!" : "!"}</h2>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-[#10b981]" /> Balance Card</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#9ca3af]">Show Balance Card</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.showBalanceCard} onChange={(e) => setSettings({...settings, showBalanceCard: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Label</label>
                  <input type="text" value={settings.balanceLabel} onChange={(e) => setSettings({...settings, balanceLabel: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Currency</label>
                  <select value={settings.currencySymbol} onChange={(e) => setSettings({...settings, currencySymbol: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none">
                    <option value="LKR">LKR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Ads Progress */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2"><Target className="h-5 w-5 text-[#3b82f6]" /> Ads Progress</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#9ca3af]">Show Ads Progress</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.showAdsProgress} onChange={(e) => setSettings({...settings, showAdsProgress: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Total Ads Required (for withdrawal)</label>
                <input type="number" value={settings.totalAdsRequired} onChange={(e) => setSettings({...settings, totalAdsRequired: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
              <div className="bg-[#0f1419] rounded-xl p-4 border border-[#2a3a4d]">
                <p className="text-[#6b7280] text-xs mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#10b981]/20 flex items-center justify-center">
                    <Target className="h-5 w-5 text-[#10b981]" />
                  </div>
                  <div>
                    <p className="text-[#9ca3af] text-sm">{settings.adsProgressLabel}</p>
                    <p className="text-white text-xl font-bold">0/{settings.totalAdsRequired}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2"><Monitor className="h-5 w-5 text-[#8b5cf6]" /> Navigation Tabs</h3>
            </div>
            <div className="p-6 space-y-3">
              {tabs.map((tab) => (
                <div key={tab.id} className="flex items-center gap-4 p-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                  <GripVertical className="h-5 w-5 text-[#6b7280] cursor-move" />
                  <input type="text" value={tab.name} onChange={(e) => setTabs(tabs.map(t => t.id === tab.id ? {...t, name: e.target.value} : t))} className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={tab.enabled} onChange={(e) => setTabs(tabs.map(t => t.id === tab.id ? {...t, enabled: e.target.checked} : t))} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Video Section */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2"><Video className="h-5 w-5 text-[#ef4444]" /> Video Player</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#9ca3af]">Show Video Player</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.showVideo} onChange={(e) => setSettings({...settings, showVideo: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Video URL</label>
                <input type="url" value={settings.videoUrl} onChange={(e) => setSettings({...settings, videoUrl: e.target.value})} placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Title</label>
                  <input type="text" value={settings.videoTitle} onChange={(e) => setSettings({...settings, videoTitle: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Subtitle</label>
                  <input type="text" value={settings.videoSubtitle} onChange={(e) => setSettings({...settings, videoSubtitle: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
                </div>
              </div>
              
              {/* Video Stats */}
              <div className="pt-4 border-t border-[#2a3a4d]">
                <p className="text-white text-sm font-medium mb-3">Video Stats Display</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "showDollarStat", icon: DollarSign, color: "#10b981", label: "$ Dollar" },
                    { key: "showCoinsStat", icon: Coins, color: "#f59e0b", label: "🪙 Coins" },
                    { key: "showLightningStat", icon: Zap, color: "#eab308", label: "⚡ Energy" },
                  ].map((stat) => (
                    <div key={stat.key} className="flex flex-col items-center gap-2 p-3 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
                      <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                      <span className="text-[#6b7280] text-xs">{stat.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings[stat.key as keyof typeof settings] as boolean} onChange={(e) => setSettings({...settings, [stat.key]: e.target.checked})} className="sr-only peer" />
                        <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Marquee */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#f59e0b]" /> Scrolling Marquee</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#9ca3af]">Show Marquee</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.showMarquee} onChange={(e) => setSettings({...settings, showMarquee: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Marquee Text</label>
                <textarea value={settings.marqueeText} onChange={(e) => setSettings({...settings, marqueeText: e.target.value})} rows={3} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none resize-none" />
              </div>
            </div>
          </div>

          {/* Ad Card Badges */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2"><Eye className="h-5 w-5 text-[#ec4899]" /> Ad Card Badges</h3>
              <button onClick={() => setBadges([...badges, { id: Date.now(), name: "New", color: "#6b7280", enabled: true }])} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            <div className="p-6 space-y-3">
              {badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                  <input type="color" value={badge.color} onChange={(e) => setBadges(badges.map(b => b.id === badge.id ? {...b, color: e.target.value} : b))} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <input type="text" value={badge.name} onChange={(e) => setBadges(badges.map(b => b.id === badge.id ? {...b, name: e.target.value} : b))} className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: badge.color }}>{badge.name}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={badge.enabled} onChange={(e) => setBadges(badges.map(b => b.id === badge.id ? {...b, enabled: e.target.checked} : b))} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                  <button onClick={() => setBadges(badges.filter(b => b.id !== badge.id))} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
