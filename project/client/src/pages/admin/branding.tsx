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
        credentials: "include",
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
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Error", description: "Logo must be less than 2MB", variant: "destructive" });
        return;
      }
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
      if (file.size > 1 * 1024 * 1024) {
        toast({ title: "Error", description: "Favicon must be less than 1MB", variant: "destructive" });
        return;
      }
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
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-600 transition-all disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Identity */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Site Identity</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Site Name</label>
              <input
                type="text"
                value={branding.siteName}
                onChange={(e) => setBranding({ ...branding, siteName: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tagline</label>
              <input
                type="text"
                value={branding.siteTagline}
                onChange={(e) => setBranding({ ...branding, siteTagline: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Site Description</label>
              <textarea
                value={branding.siteDescription}
                onChange={(e) => setBranding({ ...branding, siteDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <ImageIcon className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Logo</h2>
          </div>
          <div
            onClick={() => logoInputRef.current?.click()}
            className="border-2 border-dashed border-[#2a3a4d] rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
          >
            {logoPreview ? (
              <div className="relative inline-block">
                <img src={logoPreview} alt="Logo" className="max-h-24 mx-auto" />
                <button
                  onClick={(e) => { e.stopPropagation(); setLogoPreview(null); setBranding({ ...branding, logoUrl: "" }); }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">Click to upload logo</p>
                <p className="text-gray-500 text-sm mt-1">PNG, JPG, SVG (max 2MB)</p>
              </>
            )}
          </div>
          <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Favicon */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Favicon</h2>
          <div
            onClick={() => faviconInputRef.current?.click()}
            className="border-2 border-dashed border-[#2a3a4d] rounded-xl p-6 text-center cursor-pointer hover:border-purple-500/50 transition-colors flex items-center gap-4"
          >
            {faviconPreview ? (
              <div className="relative">
                <img src={faviconPreview} alt="Favicon" className="w-16 h-16 object-contain" />
                <button
                  onClick={(e) => { e.stopPropagation(); setFaviconPreview(null); setBranding({ ...branding, faviconUrl: "" }); }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 bg-[#0f1419] rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-gray-500" />
              </div>
            )}
            <div className="text-left">
              <p className="text-gray-400">Upload a square image (32x32 or 64x64 recommended)</p>
              <p className="text-gray-500 text-sm">This appears in browser tabs</p>
            </div>
          </div>
          <input ref={faviconInputRef} type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
        </div>

        {/* Footer */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Footer Branding</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Footer Text</label>
              <input
                type="text"
                value={branding.footerText}
                onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Copyright Year</label>
              <input
                type="text"
                value={branding.copyrightYear}
                onChange={(e) => setBranding({ ...branding, copyrightYear: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
