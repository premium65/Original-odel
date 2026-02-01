import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Home, Save, Megaphone, Sparkles, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminContentHome() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState({
    heroTitle: "Where Luxury and Rewards Meet",
    heroSubtitle: "Join OdelAdsPro and start earning real money by watching premium fashion advertisements.",
    marqueeText: "🎉 Welcome Bonus: 25,000 LKR for new users!",
    flashSaleText: "Flash Sale: Earn 2x rewards this weekend!",
    ctaText: "Start Earning Now",
    ctaLink: "/register",
    welcomeBonus: "25000",
    adReward: "101.75"
  });

  const { data: settings = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/settings/content"],
  });

  useEffect(() => {
    const homeSetting = settings.find(s => s.type === "home");
    if (homeSetting?.data) {
      setContent({ ...content, ...homeSetting.data });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof content) => {
      const res = await fetch("/api/admin/settings/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "home", data }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/content"] });
      toast({ title: "Success", description: "Home page content saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save home page content", variant: "destructive" });
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
          <h1 className="text-3xl font-bold text-white">Home Page Content</h1>
          <p className="text-[#9ca3af] mt-1">Customize your homepage text and settings</p>
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

      {/* Hero Section */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
              <Home className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Hero Section</h2>
          </div>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Hero Title</label>
            <input
              type="text"
              value={content.heroTitle}
              onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
              placeholder="Where Luxury and Rewards Meet"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Hero Subtitle</label>
            <textarea
              value={content.heroSubtitle}
              onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
              placeholder="Enter hero subtitle text..."
              rows={3}
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Marquee & Flash Sale */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Announcements</h2>
          </div>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Marquee Text (Scrolling Banner)</label>
            <input
              type="text"
              value={content.marqueeText}
              onChange={(e) => setContent({ ...content, marqueeText: e.target.value })}
              placeholder="🎉 Welcome Bonus: 25,000 LKR for new users!"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Flash Sale Text</label>
            <input
              type="text"
              value={content.flashSaleText}
              onChange={(e) => setContent({ ...content, flashSaleText: e.target.value })}
              placeholder="Flash Sale: Earn 2x rewards this weekend!"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-[#10b981]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Call to Action</h2>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">CTA Button Text</label>
            <input
              type="text"
              value={content.ctaText}
              onChange={(e) => setContent({ ...content, ctaText: e.target.value })}
              placeholder="Start Earning Now"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">CTA Button Link</label>
            <input
              type="text"
              value={content.ctaLink}
              onChange={(e) => setContent({ ...content, ctaLink: e.target.value })}
              placeholder="/register"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Earning Values */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#06b6d4]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Display Values</h2>
          </div>
          <p className="text-[#6b7280] text-sm mt-1">These are display values shown on the homepage (actual earnings come from backend)</p>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Welcome Bonus Display (LKR)</label>
            <input
              type="text"
              value={content.welcomeBonus}
              onChange={(e) => setContent({ ...content, welcomeBonus: e.target.value })}
              placeholder="25000"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Ad Reward Display (LKR per ad)</label>
            <input
              type="text"
              value={content.adReward}
              onChange={(e) => setContent({ ...content, adReward: e.target.value })}
              placeholder="101.75"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
