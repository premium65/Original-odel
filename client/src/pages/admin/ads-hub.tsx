import { useState } from "react";
import { MousePointerClick, Save, Plus, Trash2, Edit, Eye, Clock, DollarSign, Link, GripVertical, Target, Zap, ExternalLink, Play } from "lucide-react";

interface ClickableAd {
  id: number;
  number: string;
  duration: number;
  reward: number;
  url: string;
  type: string;
  enabled: boolean;
  order: number;
}

export default function AdsHub() {
  const [pageSettings, setPageSettings] = useState({
    title: "Ad's Hub",
    headerTitle: "Click Ads to Earn Money",
    headerGradientStart: "#f97316",
    headerGradientEnd: "#ec4899",
    totalAdsRequired: 28,
    showAdsCompleted: true,
    showAdsRemaining: true,
    adsCompletedLabel: "Ads Completed",
    adsRemainingLabel: "Remaining",
    viewButtonText: "View Ads",
    linkBadgeText: "Link/URL",
    showLinkBadge: true,
    showAdCounter: true,
    adCounterFormat: "Ad {current} of {total}",
    currency: "LKR",
  });

  const [ads, setAds] = useState<ClickableAd[]>([]);

  const handleSave = () => alert("Ads Hub settings saved!");

  const addAd = () => {
    const newOrder = ads.length + 1;
    setAds([...ads, {
      id: Date.now(),
      number: newOrder.toString().padStart(2, '0'),
      duration: 10,
      reward: 50.00,
      url: "",
      type: "link",
      enabled: true,
      order: newOrder
    }]);
  };

  const enabledAds = ads.filter(ad => ad.enabled);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ec4899] flex items-center justify-center">
            <MousePointerClick className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Ads Hub Settings</h1>
            <p className="text-[#9ca3af]">Manage clickable ads and rewards</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={addAd} className="px-5 py-2.5 bg-[#3b82f6] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
            <Plus className="h-5 w-5" /> Add Ad
          </button>
          <button onClick={handleSave} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
            <Save className="h-5 w-5" /> Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Page Settings */}
        <div className="space-y-6">
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2"><Edit className="h-5 w-5 text-[#f59e0b]" /> Page Settings</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Page Title</label>
                <input type="text" value={pageSettings.title} onChange={(e) => setPageSettings({...pageSettings, title: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Header Title</label>
                <input type="text" value={pageSettings.headerTitle} onChange={(e) => setPageSettings({...pageSettings, headerTitle: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Total Ads Required</label>
                <input type="number" value={pageSettings.totalAdsRequired} onChange={(e) => setPageSettings({...pageSettings, totalAdsRequired: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Currency</label>
                <select value={pageSettings.currency} onChange={(e) => setPageSettings({...pageSettings, currency: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none">
                  <option value="LKR">LKR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">View Button Text</label>
                <input type="text" value={pageSettings.viewButtonText} onChange={(e) => setPageSettings({...pageSettings, viewButtonText: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
            </div>
          </div>

          {/* Header Gradient */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2"><Zap className="h-5 w-5 text-[#f97316]" /> Header Gradient</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Start Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={pageSettings.headerGradientStart} onChange={(e) => setPageSettings({...pageSettings, headerGradientStart: e.target.value})} className="w-12 h-10 rounded cursor-pointer border-0" />
                    <input type="text" value={pageSettings.headerGradientStart} onChange={(e) => setPageSettings({...pageSettings, headerGradientStart: e.target.value})} className="flex-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">End Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={pageSettings.headerGradientEnd} onChange={(e) => setPageSettings({...pageSettings, headerGradientEnd: e.target.value})} className="w-12 h-10 rounded cursor-pointer border-0" />
                    <input type="text" value={pageSettings.headerGradientEnd} onChange={(e) => setPageSettings({...pageSettings, headerGradientEnd: e.target.value})} className="flex-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none" />
                  </div>
                </div>
              </div>
              {/* Preview */}
              <div className="rounded-xl p-4 text-center text-white font-bold" style={{ background: `linear-gradient(135deg, ${pageSettings.headerGradientStart}, ${pageSettings.headerGradientEnd})` }}>
                {pageSettings.headerTitle}
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6">
            <h3 className="text-white font-semibold mb-4">Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#0f1419] rounded-xl text-center">
                <p className="text-2xl font-bold text-[#10b981]">{enabledAds.length}</p>
                <p className="text-[#6b7280] text-sm">Active Ads</p>
              </div>
              <div className="p-4 bg-[#0f1419] rounded-xl text-center">
                <p className="text-2xl font-bold text-[#f59e0b]">{pageSettings.currency} {enabledAds.reduce((sum, ad) => sum + ad.reward, 0).toFixed(2)}</p>
                <p className="text-[#6b7280] text-sm">Total Rewards</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ads List */}
        <div className="xl:col-span-2 bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
          <div className="px-6 py-4 border-b border-[#2a3a4d]">
            <h3 className="text-white font-semibold flex items-center gap-2"><Target className="h-5 w-5 text-[#10b981]" /> Clickable Ads ({ads.length})</h3>
          </div>
          <div className="p-6 space-y-4 max-h-[700px] overflow-y-auto">
            {ads.map((ad, index) => (
              <div key={ad.id} className={`p-4 rounded-xl border ${ad.enabled ? "bg-[#0f1419] border-[#2a3a4d]" : "bg-[#0f1419]/50 border-[#2a3a4d]/50 opacity-60"}`}>
                <div className="flex items-center gap-4">
                  <GripVertical className="h-5 w-5 text-[#6b7280] cursor-move" />
                  
                  {/* Ad Number */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ec4899] flex items-center justify-center text-white font-bold">
                    #{ad.number}
                  </div>
                  
                  {/* Ad Details */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-[#6b7280] mb-1">Duration (seconds)</label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#f59e0b]" />
                        <input type="number" value={ad.duration} onChange={(e) => setAds(ads.map(a => a.id === ad.id ? {...a, duration: parseInt(e.target.value) || 0} : a))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-[#6b7280] mb-1">Reward ({pageSettings.currency})</label>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-[#10b981]" />
                        <input type="number" step="0.01" value={ad.reward} onChange={(e) => setAds(ads.map(a => a.id === ad.id ? {...a, reward: parseFloat(e.target.value) || 0} : a))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-[#6b7280] mb-1">Type</label>
                      <select value={ad.type} onChange={(e) => setAds(ads.map(a => a.id === ad.id ? {...a, type: e.target.value} : a))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none">
                        <option value="link">🔗 Link/URL</option>
                        <option value="video">📹 Video</option>
                        <option value="image">🖼️ Image</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#6b7280] mb-1">URL</label>
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4 text-[#3b82f6]" />
                        <input type="url" value={ad.url} onChange={(e) => setAds(ads.map(a => a.id === ad.id ? {...a, url: e.target.value} : a))} placeholder="https://..." className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAds(ads.map(a => a.id === ad.id ? {...a, enabled: !a.enabled} : a))} className={`w-10 h-10 rounded-lg flex items-center justify-center ${ad.enabled ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#6b7280]/20 text-[#6b7280]"}`}>
                      <Eye className="h-5 w-5" />
                    </button>
                    <button onClick={() => setAds(ads.filter(a => a.id !== ad.id))} className="w-10 h-10 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Ad Preview Card */}
                <div className="mt-4 p-4 bg-[#1a2332] rounded-xl border border-[#2a3a4d]">
                  <p className="text-[#6b7280] text-xs mb-2">Preview:</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ec4899] flex items-center justify-center text-white font-bold text-lg">
                        #{ad.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-[#9ca3af]" />
                          <span className="text-white">Duration: <span className="text-[#f59e0b] font-semibold">{ad.duration} Seconds</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-[#9ca3af]" />
                          <span className="text-white">Reward: <span className="text-[#10b981] font-semibold">{ad.reward.toFixed(2)} {pageSettings.currency}</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-semibold rounded-full flex items-center gap-1">
                        {ad.type === "video" ? <Play className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
                        {ad.type === "link" ? "Link/URL" : ad.type === "video" ? "Video" : "Image"}
                      </span>
                      <button className="px-6 py-2 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-lg text-sm">
                        {pageSettings.viewButtonText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {ads.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-[#2a3a4d] mx-auto mb-4" />
                <p className="text-[#6b7280]">No clickable ads yet</p>
                <button onClick={addAd} className="mt-4 px-4 py-2 bg-[#10b981]/20 text-[#10b981] rounded-lg text-sm">
                  Add Your First Ad
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
