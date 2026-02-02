import { useState, useRef } from "react";
import {
  LayoutDashboard, Save, Upload, Video, Type, Target,
  Sparkles, Monitor, DollarSign, Coins, Zap, Plus,
  Trash2, GripVertical, Eye, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TabItem {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export default function DashboardSettings() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('video/')) {
      toast({ title: "Invalid file type", description: "Please select a video file", variant: "destructive" });
      return;
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 100MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await fetch('/api/admin/settings/upload-video', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setSettings({ ...settings, videoUrl: data.videoUrl });
      toast({ title: "Video Uploaded!", description: "Dashboard video has been updated." });
    } catch (error) {
      toast({ title: "Upload Failed", description: "Could not upload video", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const [tabs, setTabs] = useState<TabItem[]>([
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

  const handleSave = () => {
    alert("Dashboard settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Settings</h1>
            <p className="text-[#9ca3af]">Configure user dashboard appearance</p>
          </div>
        </div>
        <button onClick={handleSave} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
          <Save className="h-5 w-5" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Type className="h-5 w-5 text-[#f59e0b]" /> Welcome Section
              </h3>
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
              <h3 className="text-white font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#10b981]" /> Balance Card
              </h3>
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
                  <input type="text" value={settings.balanceLabel} onChange={(e) => setSettings({...settings, balanceLabel: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]" />
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
              <div className="flex items-center justify-between py-3 border-t border-[#2a3a4d]">
                <span className="text-[#9ca3af]">Show Change Indicator (+0.00)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.showChangeIndicator} onChange={(e) => setSettings({...settings, showChangeIndicator: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Ads Progress */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-[#3b82f6]" /> Ads Progress
              </h3>
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
                <label className="block text-sm text-[#9ca3af] mb-2">Label</label>
                <input type="text" value={settings.adsProgressLabel} onChange={(e) => setSettings({...settings, adsProgressLabel: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#3b82f6]" />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Total Ads Required (for withdrawal unlock)</label>
                <input type="number" value={settings.totalAdsRequired} onChange={(e) => setSettings({...settings, totalAdsRequired: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#3b82f6]" />
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
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Monitor className="h-5 w-5 text-[#8b5cf6]" /> Navigation Tabs
              </h3>
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
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Video className="h-5 w-5 text-[#ef4444]" /> Video Player
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#9ca3af]">Show Video Player</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.showVideo} onChange={(e) => setSettings({...settings, showVideo: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              {/* Video Upload */}
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Upload Video</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-1 px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] border-dashed rounded-xl text-white flex items-center justify-center gap-2 hover:border-[#ef4444] transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-[#ef4444]" />
                        <span>Upload Video File</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#6b7280] mt-2">Max file size: 100MB. Supported formats: MP4, WebM, MOV</p>
              </div>

              {/* Current Video Preview */}
              {settings.videoUrl && (
                <div className="bg-[#0f1419] rounded-xl p-4 border border-[#2a3a4d]">
                  <p className="text-[#6b7280] text-xs mb-2">Current Video:</p>
                  <video
                    src={settings.videoUrl}
                    className="w-full h-32 object-cover rounded-lg"
                    controls
                  />
                  <button
                    onClick={() => setSettings({...settings, videoUrl: ""})}
                    className="mt-2 text-xs text-[#ef4444] hover:underline"
                  >
                    Remove Video
                  </button>
                </div>
              )}

              {/* Or use URL */}
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Or enter Video URL</label>
                <input type="url" value={settings.videoUrl} onChange={(e) => setSettings({...settings, videoUrl: e.target.value})} placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#ef4444]" />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
                  <span className="text-[#9ca3af] text-sm">LIVE Badge</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.showLiveBadge} onChange={(e) => setSettings({...settings, showLiveBadge: e.target.checked})} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#ef4444] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
                  <span className="text-[#9ca3af] text-sm">Autoplay</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.autoplay} onChange={(e) => setSettings({...settings, autoplay: e.target.checked})} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
              </div>
              
              {/* Video Stats */}
              <div className="pt-4 border-t border-[#2a3a4d]">
                <p className="text-white text-sm font-medium mb-3">Video Stats Display</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center gap-2 p-3 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
                    <DollarSign className="h-5 w-5 text-[#10b981]" />
                    <span className="text-[#6b7280] text-xs">$ Dollar</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings.showDollarStat} onChange={(e) => setSettings({...settings, showDollarStat: e.target.checked})} className="sr-only peer" />
                      <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </label>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
                    <Coins className="h-5 w-5 text-[#f59e0b]" />
                    <span className="text-[#6b7280] text-xs">🪙 Coins</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings.showCoinsStat} onChange={(e) => setSettings({...settings, showCoinsStat: e.target.checked})} className="sr-only peer" />
                      <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#f59e0b] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </label>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
                    <Zap className="h-5 w-5 text-[#eab308]" />
                    <span className="text-[#6b7280] text-xs">⚡ Energy</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings.showLightningStat} onChange={(e) => setSettings({...settings, showLightningStat: e.target.checked})} className="sr-only peer" />
                      <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#eab308] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Marquee */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#f59e0b]" /> Scrolling Marquee
              </h3>
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
                <textarea value={settings.marqueeText} onChange={(e) => setSettings({...settings, marqueeText: e.target.value})} rows={3} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#f59e0b] resize-none" />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Scroll Speed: {settings.marqueeSpeed}</label>
                <input type="range" min="10" max="100" value={settings.marqueeSpeed} onChange={(e) => setSettings({...settings, marqueeSpeed: parseInt(e.target.value)})} className="w-full" />
                <div className="flex justify-between text-xs text-[#6b7280] mt-1">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ad Card Badges */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#ec4899]" /> Ad Card Badges
              </h3>
              <button onClick={() => setBadges([...badges, { id: Date.now(), name: "New", color: "#6b7280", enabled: true }])} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1 hover:bg-[#10b981]/30">
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
                  <button onClick={() => setBadges(badges.filter(b => b.id !== badge.id))} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30">
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
