import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Save, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminBranding() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  
  const [branding, setBranding] = useState({
    siteName: "OdelADS",
    siteTagline: "ADS PRO",
    siteDescription: "Where Luxury and Rewards Meet",
    logoUrl: "",
    faviconUrl: "",
    footerText: "© 2024 OdelAdsPro. All rights reserved.",
    copyrightYear: "2024"
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const { data: settings = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/settings/branding"],
  });

  useEffect(() => {
    const brandingSetting = settings.find(s => s.type === "branding");
    if (brandingSetting?.data) {
      setBranding({ ...branding, ...brandingSetting.data });
      if (brandingSetting.data.logoUrl) setLogoPreview(brandingSetting.data.logoUrl);
      if (brandingSetting.data.faviconUrl) setFaviconPreview(brandingSetting.data.faviconUrl);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof branding) => {
      const res = await fetch("/api/admin/settings/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "branding", data }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/branding"] });
      toast({ title: "Success", description: "Branding settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save branding settings", variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(branding);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setBranding({ ...branding, logoUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFaviconPreview(base64);
        setBranding({ ...branding, faviconUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Logo & Branding</h1>
          <p className="text-[#9ca3af] mt-1">Customize your site's branding and identity</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] text-white rounded-xl hover:bg-[#059669] transition-colors"
        >
          <Save className="w-5 h-5" />
          <span className="font-medium">{saveMutation.isPending ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Identity */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
          <div className="p-5 border-b border-[#2a3a4d]">
            <h2 className="text-lg font-semibold text-white">Site Identity</h2>
          </div>
          <div className="p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-2">Site Name</label>
              <input
                type="text"
                value={branding.siteName}
                onChange={(e) => setBranding({ ...branding, siteName: e.target.value })}
                placeholder="OdelADS"
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-2">Tagline</label>
              <input
                type="text"
                value={branding.siteTagline}
                onChange={(e) => setBranding({ ...branding, siteTagline: e.target.value })}
                placeholder="ADS PRO"
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-2">Site Description</label>
              <textarea
                value={branding.siteDescription}
                onChange={(e) => setBranding({ ...branding, siteDescription: e.target.value })}
                placeholder="Where Luxury and Rewards Meet"
                rows={3}
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
          <div className="p-5 border-b border-[#2a3a4d]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <h2 className="text-lg font-semibold text-white">Logo</h2>
            </div>
          </div>
          <div className="p-5">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            
            {logoPreview ? (
              <div className="relative">
                <div className="w-full h-40 bg-[#0f1419] rounded-xl flex items-center justify-center p-4">
                  <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
                <button
                  onClick={() => {
                    setLogoPreview(null);
                    setBranding({ ...branding, logoUrl: "" });
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => logoInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-[#2a3a4d] rounded-xl flex flex-col items-center justify-center hover:border-[#10b981] transition-colors"
              >
                <Upload className="w-8 h-8 text-[#6b7280] mb-2" />
                <span className="text-[#9ca3af]">Click to upload logo</span>
                <span className="text-xs text-[#6b7280] mt-1">PNG, JPG, SVG (max 2MB)</span>
              </button>
            )}
          </div>
        </div>

        {/* Favicon Upload */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
          <div className="p-5 border-b border-[#2a3a4d]">
            <h2 className="text-lg font-semibold text-white">Favicon</h2>
          </div>
          <div className="p-5">
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/*"
              onChange={handleFaviconUpload}
              className="hidden"
            />
            
            <div className="flex items-center gap-4">
              {faviconPreview ? (
                <div className="relative">
                  <div className="w-16 h-16 bg-[#0f1419] rounded-xl flex items-center justify-center p-2">
                    <img src={faviconPreview} alt="Favicon" className="max-h-full max-w-full object-contain" />
                  </div>
                  <button
                    onClick={() => {
                      setFaviconPreview(null);
                      setBranding({ ...branding, faviconUrl: "" });
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-[#ef4444] text-white rounded-full hover:bg-[#dc2626]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => faviconInputRef.current?.click()}
                  className="w-16 h-16 border-2 border-dashed border-[#2a3a4d] rounded-xl flex items-center justify-center hover:border-[#10b981] transition-colors"
                >
                  <Upload className="w-6 h-6 text-[#6b7280]" />
                </button>
              )}
              <div>
                <p className="text-[#9ca3af] text-sm">Upload a square image (32x32 or 64x64 recommended)</p>
                <p className="text-xs text-[#6b7280] mt-1">This appears in browser tabs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Settings */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
          <div className="p-5 border-b border-[#2a3a4d]">
            <h2 className="text-lg font-semibold text-white">Footer Branding</h2>
          </div>
          <div className="p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-2">Footer Text</label>
              <input
                type="text"
                value={branding.footerText}
                onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                placeholder="© 2024 OdelAdsPro. All rights reserved."
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-2">Copyright Year</label>
              <input
                type="text"
                value={branding.copyrightYear}
                onChange={(e) => setBranding({ ...branding, copyrightYear: e.target.value })}
                placeholder="2024"
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white">Preview</h2>
        </div>
        <div className="p-5">
          <div className="bg-[#0f1419] rounded-xl p-6">
            {/* Logo Preview */}
            <div className="flex items-center gap-3 mb-6">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-10 object-contain" />
              ) : (
                <div className="border-2 border-white px-3 py-1">
                  <span className="text-white text-xl font-serif tracking-wider">{branding.siteName}</span>
                  <span className="text-white text-[10px] block -mt-1 tracking-widest">{branding.siteTagline}</span>
                </div>
              )}
            </div>
            
            {/* Description */}
            <p className="text-[#9ca3af] mb-6">{branding.siteDescription}</p>
            
            {/* Footer Preview */}
            <div className="pt-4 border-t border-[#2a3a4d]">
              <p className="text-[#6b7280] text-sm">{branding.footerText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
