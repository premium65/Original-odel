import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Type, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminContentText() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState({
    // Navbar Labels
    navHome: "Home",
    navFeatures: "Features",
    navAds: "Ads",
    navWallet: "Wallet",
    navWithdraw: "Withdraw",
    navLogin: "Login",
    navRegister: "Register",
    navLogout: "Logout",
    // Page Titles
    pageFeaturesTitle: "Features",
    pageAdsTitle: "Watch Ads",
    pageWalletTitle: "Your Wallet",
    pageWithdrawTitle: "Withdraw Funds",
    pageLoginTitle: "Login to Your Account",
    pageRegisterTitle: "Create Account",
    // Button Labels
    btnWatchAd: "Watch Ad",
    btnClaim: "Claim Reward",
    btnWithdraw: "Request Withdrawal",
    btnSubmit: "Submit",
    btnCancel: "Cancel",
    // Footer Text
    footerCopyright: "© 2024 OdelAdsPro. All rights reserved.",
    footerTagline: "Where Luxury and Rewards Meet"
  });

  const { data: settings = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/settings/content"],
  });

  useEffect(() => {
    const textSetting = settings.find(s => s.type === "labels");
    if (textSetting?.data) {
      setContent({ ...content, ...textSetting.data });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof content) => {
      const res = await fetch("/api/admin/settings/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "labels", data }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/content"] });
      toast({ title: "Success", description: "Text & Labels saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save Text & Labels", variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(content);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Text & Labels</h1>
          <p className="text-[#9ca3af] mt-1">Customize all text labels across the site</p>
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

      {/* Navbar Labels */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
              <Type className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Navigation Labels</h2>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "navHome", label: "Home" },
            { key: "navFeatures", label: "Features" },
            { key: "navAds", label: "Ads" },
            { key: "navWallet", label: "Wallet" },
            { key: "navWithdraw", label: "Withdraw" },
            { key: "navLogin", label: "Login" },
            { key: "navRegister", label: "Register" },
            { key: "navLogout", label: "Logout" },
          ].map(item => (
            <div key={item.key}>
              <label className="block text-xs text-[#6b7280] mb-1">{item.label}</label>
              <input
                type="text"
                value={(content as any)[item.key]}
                onChange={(e) => setContent({ ...content, [item.key]: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm focus:border-[#10b981] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Page Titles */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white">Page Titles</h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "pageFeaturesTitle", label: "Features Page" },
            { key: "pageAdsTitle", label: "Ads Page" },
            { key: "pageWalletTitle", label: "Wallet Page" },
            { key: "pageWithdrawTitle", label: "Withdraw Page" },
            { key: "pageLoginTitle", label: "Login Page" },
            { key: "pageRegisterTitle", label: "Register Page" },
          ].map(item => (
            <div key={item.key}>
              <label className="block text-xs text-[#6b7280] mb-1">{item.label}</label>
              <input
                type="text"
                value={(content as any)[item.key]}
                onChange={(e) => setContent({ ...content, [item.key]: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm focus:border-[#10b981] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Button Labels */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white">Button Labels</h2>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { key: "btnWatchAd", label: "Watch Ad" },
            { key: "btnClaim", label: "Claim" },
            { key: "btnWithdraw", label: "Withdraw" },
            { key: "btnSubmit", label: "Submit" },
            { key: "btnCancel", label: "Cancel" },
          ].map(item => (
            <div key={item.key}>
              <label className="block text-xs text-[#6b7280] mb-1">{item.label}</label>
              <input
                type="text"
                value={(content as any)[item.key]}
                onChange={(e) => setContent({ ...content, [item.key]: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm focus:border-[#10b981] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white">Footer Text</h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#6b7280] mb-1">Copyright Text</label>
            <input
              type="text"
              value={content.footerCopyright}
              onChange={(e) => setContent({ ...content, footerCopyright: e.target.value })}
              className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm focus:border-[#10b981] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#6b7280] mb-1">Tagline</label>
            <input
              type="text"
              value={content.footerTagline}
              onChange={(e) => setContent({ ...content, footerTagline: e.target.value })}
              className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm focus:border-[#10b981] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
