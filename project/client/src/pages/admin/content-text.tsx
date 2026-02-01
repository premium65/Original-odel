import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Type, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminContentText() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState({
    navHome: "Home",
    navFeatures: "Features",
    navAds: "Ads",
    navWallet: "Wallet",
    navWithdraw: "Withdraw",
    navLogin: "Login",
    navRegister: "Register",
    navLogout: "Logout",
    pageFeaturesTitle: "Features",
    pageAdsTitle: "Watch Ads",
    pageWalletTitle: "Your Wallet",
    pageWithdrawTitle: "Withdraw Funds",
    pageLoginTitle: "Login to Your Account",
    pageRegisterTitle: "Create Account",
    btnWatchAd: "Watch Ad",
    btnClaim: "Claim Reward",
    btnWithdraw: "Request Withdrawal",
    btnSubmit: "Submit",
    btnCancel: "Cancel",
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
        credentials: "include",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Text & Labels</h1>
          <p className="text-[#9ca3af] mt-1">Customize all text labels across the site</p>
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

      {/* Navigation Labels */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Type className="h-5 w-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Navigation Labels</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: "navHome", label: "Home" },
            { key: "navFeatures", label: "Features" },
            { key: "navAds", label: "Ads" },
            { key: "navWallet", label: "Wallet" },
            { key: "navWithdraw", label: "Withdraw" },
            { key: "navLogin", label: "Login" },
            { key: "navRegister", label: "Register" },
            { key: "navLogout", label: "Logout" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm text-gray-400 mb-2">{label}</label>
              <input
                type="text"
                value={(content as any)[key]}
                onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Page Titles */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Page Titles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "pageFeaturesTitle", label: "Features Page" },
            { key: "pageAdsTitle", label: "Ads Page" },
            { key: "pageWalletTitle", label: "Wallet Page" },
            { key: "pageWithdrawTitle", label: "Withdraw Page" },
            { key: "pageLoginTitle", label: "Login Page" },
            { key: "pageRegisterTitle", label: "Register Page" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm text-gray-400 mb-2">{label}</label>
              <input
                type="text"
                value={(content as any)[key]}
                onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Button Labels */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Button Labels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: "btnWatchAd", label: "Watch Ad Button" },
            { key: "btnClaim", label: "Claim Button" },
            { key: "btnWithdraw", label: "Withdraw Button" },
            { key: "btnSubmit", label: "Submit Button" },
            { key: "btnCancel", label: "Cancel Button" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm text-gray-400 mb-2">{label}</label>
              <input
                type="text"
                value={(content as any)[key]}
                onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Footer Text</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Copyright Text</label>
            <input
              type="text"
              value={content.footerCopyright}
              onChange={(e) => setContent({ ...content, footerCopyright: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tagline</label>
            <input
              type="text"
              value={content.footerTagline}
              onChange={(e) => setContent({ ...content, footerTagline: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
