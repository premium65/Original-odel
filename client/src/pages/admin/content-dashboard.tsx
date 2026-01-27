import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminContentDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState({
    welcomeTitle: "Welcome to Your Dashboard",
    welcomeSubtitle: "Track your earnings and watch ads to earn money",
    balanceLabel: "Current Balance",
    earningsLabel: "Total Earnings",
    adsWatchedLabel: "Ads Watched Today",
    withdrawLabel: "Request Withdrawal",
    helperText: "Watch ads to increase your balance. Minimum withdrawal is ₹500.",
    noAdsText: "No ads available at the moment. Please check back later."
  });

  const { data: settings = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/settings/content"],
  });

  useEffect(() => {
    const dashSetting = settings.find(s => s.type === "dashboard");
    if (dashSetting?.data) {
      setContent({ ...content, ...dashSetting.data });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof content) => {
      const res = await fetch("/api/admin/settings/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "dashboard", data }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/content"] });
      toast({ title: "Success", description: "Dashboard content saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save dashboard content", variant: "destructive" });
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
          <h1 className="text-3xl font-bold text-white">Dashboard Page Content</h1>
          <p className="text-[#9ca3af] mt-1">Customize user dashboard labels and text</p>
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

      {/* Welcome Section */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Welcome Section</h2>
          </div>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Welcome Title</label>
            <input
              type="text"
              value={content.welcomeTitle}
              onChange={(e) => setContent({ ...content, welcomeTitle: e.target.value })}
              placeholder="Welcome to Your Dashboard"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Welcome Subtitle</label>
            <input
              type="text"
              value={content.welcomeSubtitle}
              onChange={(e) => setContent({ ...content, welcomeSubtitle: e.target.value })}
              placeholder="Track your earnings and watch ads to earn money"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Card Labels */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white">Card Labels</h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Balance Card Label</label>
            <input
              type="text"
              value={content.balanceLabel}
              onChange={(e) => setContent({ ...content, balanceLabel: e.target.value })}
              placeholder="Current Balance"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Earnings Card Label</label>
            <input
              type="text"
              value={content.earningsLabel}
              onChange={(e) => setContent({ ...content, earningsLabel: e.target.value })}
              placeholder="Total Earnings"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Ads Watched Label</label>
            <input
              type="text"
              value={content.adsWatchedLabel}
              onChange={(e) => setContent({ ...content, adsWatchedLabel: e.target.value })}
              placeholder="Ads Watched Today"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Withdraw Button Label</label>
            <input
              type="text"
              value={content.withdrawLabel}
              onChange={(e) => setContent({ ...content, withdrawLabel: e.target.value })}
              placeholder="Request Withdrawal"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white">Helper & Empty State Text</h2>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Helper Text</label>
            <input
              type="text"
              value={content.helperText}
              onChange={(e) => setContent({ ...content, helperText: e.target.value })}
              placeholder="Watch ads to increase your balance..."
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">No Ads Available Text</label>
            <input
              type="text"
              value={content.noAdsText}
              onChange={(e) => setContent({ ...content, noAdsText: e.target.value })}
              placeholder="No ads available at the moment..."
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
