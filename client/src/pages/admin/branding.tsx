import { useState } from "react";
import { Image, Save, Upload, X } from "lucide-react";

export default function Branding() {
  const [branding, setBranding] = useState({
    siteName: "ODEL-ADS",
    tagline: "Earn Money by Watching Ads",
    logoUrl: "",
    faviconUrl: "",
    logoWidth: 120,
    logoHeight: 40,
    showLogoText: true,
    logoTextColor: "#ffffff",
    adminPanelName: "OdelADS Admin Panel",
  });

  const handleSave = () => alert("Branding settings saved!");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#eab308] flex items-center justify-center">
            <Image className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Logo & Branding</h1>
            <p className="text-[#9ca3af]">Manage site identity and branding</p>
          </div>
        </div>
        <button onClick={handleSave} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
          <Save className="h-5 w-5" /> Save
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Site Identity */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
          <div className="px-6 py-4 border-b border-[#2a3a4d]">
            <h3 className="text-white font-semibold">Site Identity</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Site Name</label>
              <input type="text" value={branding.siteName} onChange={(e) => setBranding({...branding, siteName: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Tagline</label>
              <input type="text" value={branding.tagline} onChange={(e) => setBranding({...branding, tagline: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Admin Panel Name</label>
              <input type="text" value={branding.adminPanelName} onChange={(e) => setBranding({...branding, adminPanelName: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
            </div>
          </div>
        </div>

        {/* Logo Settings */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
          <div className="px-6 py-4 border-b border-[#2a3a4d]">
            <h3 className="text-white font-semibold">Logo Settings</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Logo Image</label>
              <div className="border-2 border-dashed border-[#2a3a4d] rounded-xl p-6 text-center hover:border-[#f59e0b] transition-all cursor-pointer">
                {branding.logoUrl ? (
                  <div className="relative inline-block">
                    <img src={branding.logoUrl} alt="Logo" className="max-h-20" />
                    <button onClick={() => setBranding({...branding, logoUrl: ""})} className="absolute -top-2 -right-2 w-6 h-6 bg-[#ef4444] text-white rounded-full flex items-center justify-center">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-[#6b7280] mx-auto mb-2" />
                    <p className="text-[#9ca3af]">Click to upload logo</p>
                    <p className="text-[#6b7280] text-sm">PNG, JPG, SVG (recommended: 240x80px)</p>
                  </>
                )}
              </div>
              <input type="text" value={branding.logoUrl} onChange={(e) => setBranding({...branding, logoUrl: e.target.value})} placeholder="Or enter image URL" className="w-full mt-2 px-4 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Logo Width (px)</label>
                <input type="number" value={branding.logoWidth} onChange={(e) => setBranding({...branding, logoWidth: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Logo Height (px)</label>
                <input type="number" value={branding.logoHeight} onChange={(e) => setBranding({...branding, logoHeight: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Favicon */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
          <div className="px-6 py-4 border-b border-[#2a3a4d]">
            <h3 className="text-white font-semibold">Favicon</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="border-2 border-dashed border-[#2a3a4d] rounded-xl p-6 text-center hover:border-[#f59e0b] transition-all cursor-pointer">
              {branding.faviconUrl ? (
                <div className="relative inline-block">
                  <img src={branding.faviconUrl} alt="Favicon" className="w-16 h-16" />
                  <button onClick={() => setBranding({...branding, faviconUrl: ""})} className="absolute -top-2 -right-2 w-6 h-6 bg-[#ef4444] text-white rounded-full flex items-center justify-center">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[#2a3a4d] rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <Image className="h-8 w-8 text-[#6b7280]" />
                  </div>
                  <p className="text-[#9ca3af]">Click to upload favicon</p>
                  <p className="text-[#6b7280] text-sm">ICO, PNG (32x32px or 64x64px)</p>
                </>
              )}
            </div>
            <input type="text" value={branding.faviconUrl} onChange={(e) => setBranding({...branding, faviconUrl: e.target.value})} placeholder="Or enter favicon URL" className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
          </div>
        </div>

        {/* Logo Text Settings */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
          <div className="px-6 py-4 border-b border-[#2a3a4d]">
            <h3 className="text-white font-semibold">Text Logo (Fallback)</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#9ca3af]">Show Text if No Logo</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={branding.showLogoText} onChange={(e) => setBranding({...branding, showLogoText: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Text Color</label>
              <div className="flex gap-3">
                <input type="color" value={branding.logoTextColor} onChange={(e) => setBranding({...branding, logoTextColor: e.target.value})} className="w-12 h-10 rounded cursor-pointer border-0" />
                <input type="text" value={branding.logoTextColor} onChange={(e) => setBranding({...branding, logoTextColor: e.target.value})} className="flex-1 px-4 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white font-mono outline-none" />
              </div>
            </div>
            {/* Preview */}
            <div className="p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <p className="text-[#6b7280] text-xs mb-2">Preview:</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-[#f59e0b] to-[#eab308] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {branding.siteName.charAt(0)}
                </div>
                <h2 className="text-xl font-bold" style={{ color: branding.logoTextColor }}>{branding.siteName}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
