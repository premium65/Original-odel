import { useState, useEffect } from "react";
import { Image, Save, Upload, X, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface BrandingData {
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  logoIconUrl: string;
  faviconUrl: string;
  footerText: string;
  copyrightText: string;
}

export default function Branding() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [branding, setBranding] = useState<BrandingData>({
    siteName: "ODEL-ADS",
    siteTagline: "Earn Money by Watching Ads",
    logoUrl: "",
    logoIconUrl: "",
    faviconUrl: "",
    footerText: "",
    copyrightText: "",
  });

  const { data: brandingData, isLoading } = useQuery({
    queryKey: ["admin-branding"],
    queryFn: api.getBranding,
  });

  useEffect(() => {
    if (brandingData) {
      setBranding(prev => ({ ...prev, ...brandingData }));
    }
  }, [brandingData]);

  const mutation = useMutation({
    mutationFn: api.updateBranding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-branding"] });
      toast({ title: "Branding settings saved!" });
    },
    onError: () => {
      toast({ title: "Failed to save branding settings", variant: "destructive" });
    },
  });

  const handleSave = () => {
    mutation.mutate(branding);
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#eab308] flex items-center justify-center">
            <Image className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Logo & Branding</h1>
            <p className="text-[#9ca3af]">Manage site identity and branding</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save
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
              <input type="text" value={branding.siteTagline} onChange={(e) => setBranding({...branding, siteTagline: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Footer Text</label>
              <input type="text" value={branding.footerText || ""} onChange={(e) => setBranding({...branding, footerText: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" placeholder="Footer text..." />
            </div>
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Copyright Text</label>
              <input type="text" value={branding.copyrightText || ""} onChange={(e) => setBranding({...branding, copyrightText: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" placeholder="© 2024 ODEL-ADS. All rights reserved." />
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
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Logo Icon (Small)</label>
              <input type="text" value={branding.logoIconUrl || ""} onChange={(e) => setBranding({...branding, logoIconUrl: e.target.value})} placeholder="Enter icon URL" className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
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
            <input type="text" value={branding.faviconUrl || ""} onChange={(e) => setBranding({...branding, faviconUrl: e.target.value})} placeholder="Or enter favicon URL" className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
          </div>
        </div>

        {/* Preview */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
          <div className="px-6 py-4 border-b border-[#2a3a4d]">
            <h3 className="text-white font-semibold">Preview</h3>
          </div>
          <div className="p-6">
            <div className="p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <p className="text-[#6b7280] text-xs mb-2">Header Preview:</p>
              <div className="flex items-center gap-3">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt="Logo" className="h-10" />
                ) : (
                  <>
                    <div className="w-11 h-11 bg-gradient-to-br from-[#f59e0b] to-[#eab308] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {branding.siteName.charAt(0)}
                    </div>
                    <h2 className="text-xl font-bold text-white">{branding.siteName}</h2>
                  </>
                )}
              </div>
              <p className="text-[#9ca3af] text-sm mt-2">{branding.siteTagline}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
