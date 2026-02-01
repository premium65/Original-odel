import { useState, useEffect } from "react";
import { Home, Save, Plus, Trash2, Upload, GripVertical, Eye, EyeOff, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ContentHome() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [heroSection, setHeroSection] = useState({
    enabled: true,
    title: "Welcome to ODEL-ADS",
    subtitle: "Earn Money by Watching Ads",
    description: "Join thousands of users who are earning daily by watching and interacting with advertisements.",
    buttonText: "Get Started",
    buttonLink: "/register",
    backgroundImage: "",
  });

  const [features, setFeatures] = useState([
    { id: 1, title: "Easy Earnings", description: "Watch ads and earn real money instantly", icon: "dollar", enabled: true },
    { id: 2, title: "Daily Rewards", description: "Complete tasks and get bonus rewards every day", icon: "gift", enabled: true },
    { id: 3, title: "Fast Withdrawals", description: "Withdraw your earnings to your bank account", icon: "zap", enabled: true },
  ]);

  const [howItWorks, setHowItWorks] = useState({
    enabled: true,
    title: "How It Works",
    steps: [
      { id: 1, title: "Create Account", description: "Sign up for free in less than a minute" },
      { id: 2, title: "Watch Ads", description: "View advertisements and complete simple tasks" },
      { id: 3, title: "Earn Money", description: "Get paid for every ad you watch" },
      { id: 4, title: "Withdraw", description: "Transfer earnings to your bank account" },
    ]
  });

  const [stats, setStats] = useState({
    enabled: true,
    title: "Our Numbers",
    items: [
      { id: 1, value: "50,000+", label: "Active Users" },
      { id: 2, value: "LKR 10M+", label: "Total Paid" },
      { id: 3, value: "100,000+", label: "Ads Delivered" },
      { id: 4, value: "24/7", label: "Support" },
    ]
  });

  const { data: contentData, isLoading } = useQuery({
    queryKey: ["admin-content", "home"],
    queryFn: () => api.getContent("home"),
  });

  useEffect(() => {
    if (contentData && contentData.length > 0) {
      try {
        const content = contentData[0];
        if (content.metadata) {
          const parsed = typeof content.metadata === 'string' ? JSON.parse(content.metadata) : content.metadata;
          if (parsed.heroSection) setHeroSection(prev => ({ ...prev, ...parsed.heroSection }));
          if (parsed.features) setFeatures(parsed.features);
          if (parsed.howItWorks) setHowItWorks(prev => ({ ...prev, ...parsed.howItWorks }));
          if (parsed.stats) setStats(prev => ({ ...prev, ...parsed.stats }));
        }
      } catch (e) {
        console.error("Failed to parse home content:", e);
      }
    }
  }, [contentData]);

  const mutation = useMutation({
    mutationFn: (data: any) => api.updateContent("home", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content", "home"] });
      toast({ title: "Home page content saved!" });
    },
    onError: () => {
      toast({ title: "Failed to save home page content", variant: "destructive" });
    },
  });

  const handleSave = () => {
    mutation.mutate({
      section: "main",
      title: heroSection.title,
      content: heroSection.description,
      metadata: JSON.stringify({ heroSection, features, howItWorks, stats }),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
            <Home className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Home Page Content</h1>
            <p className="text-[#9ca3af]">Manage the home/landing page content</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={mutation.isPending} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
          {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save Changes
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold">Hero Section</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={heroSection.enabled} onChange={(e) => setHeroSection({...heroSection, enabled: e.target.checked})} className="sr-only peer" />
            <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Hero Title</label>
              <input type="text" value={heroSection.title} onChange={(e) => setHeroSection({...heroSection, title: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Subtitle</label>
              <input type="text" value={heroSection.subtitle} onChange={(e) => setHeroSection({...heroSection, subtitle: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Description</label>
              <textarea value={heroSection.description} onChange={(e) => setHeroSection({...heroSection, description: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none resize-none" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Button Text</label>
                <input type="text" value={heroSection.buttonText} onChange={(e) => setHeroSection({...heroSection, buttonText: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Button Link</label>
                <input type="text" value={heroSection.buttonLink} onChange={(e) => setHeroSection({...heroSection, buttonLink: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-2">Background Image</label>
            <div className="border-2 border-dashed border-[#2a3a4d] rounded-xl p-8 text-center hover:border-[#10b981] transition-all cursor-pointer h-[200px] flex flex-col items-center justify-center">
              <Upload className="h-10 w-10 text-[#6b7280] mb-2" />
              <p className="text-[#9ca3af]">Click to upload background</p>
              <p className="text-[#6b7280] text-sm">1920x600px recommended</p>
            </div>
            <input type="text" value={heroSection.backgroundImage} onChange={(e) => setHeroSection({...heroSection, backgroundImage: e.target.value})} placeholder="Or enter image URL" className="w-full mt-2 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold">Features Section</h3>
          <button onClick={() => setFeatures([...features, { id: Date.now(), title: "New Feature", description: "", icon: "star", enabled: true }])} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="p-6 space-y-4">
          {features.map((feature) => (
            <div key={feature.id} className="flex items-center gap-4 p-4 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
              <GripVertical className="h-5 w-5 text-[#6b7280] cursor-move" />
              <select value={feature.icon} onChange={(e) => setFeatures(features.map(f => f.id === feature.id ? {...f, icon: e.target.value} : f))} className="px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none">
                <option value="dollar">💰 Dollar</option>
                <option value="gift">🎁 Gift</option>
                <option value="zap">⚡ Zap</option>
                <option value="star">⭐ Star</option>
                <option value="shield">🛡️ Shield</option>
              </select>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input type="text" value={feature.title} onChange={(e) => setFeatures(features.map(f => f.id === feature.id ? {...f, title: e.target.value} : f))} placeholder="Title" className="px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                <input type="text" value={feature.description} onChange={(e) => setFeatures(features.map(f => f.id === feature.id ? {...f, description: e.target.value} : f))} placeholder="Description" className="px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
              </div>
              <button onClick={() => setFeatures(features.map(f => f.id === feature.id ? {...f, enabled: !f.enabled} : f))} className={`w-8 h-8 rounded-lg flex items-center justify-center ${feature.enabled ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#6b7280]/20 text-[#6b7280]"}`}>
                {feature.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button onClick={() => setFeatures(features.filter(f => f.id !== feature.id))} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold">How It Works</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={howItWorks.enabled} onChange={(e) => setHowItWorks({...howItWorks, enabled: e.target.checked})} className="sr-only peer" />
            <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-[#9ca3af] mb-2">Section Title</label>
            <input type="text" value={howItWorks.title} onChange={(e) => setHowItWorks({...howItWorks, title: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {howItWorks.steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3 p-4 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                <div className="w-8 h-8 rounded-full bg-[#10b981] text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <input type="text" value={step.title} onChange={(e) => setHowItWorks({...howItWorks, steps: howItWorks.steps.map(s => s.id === step.id ? {...s, title: e.target.value} : s)})} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                  <input type="text" value={step.description} onChange={(e) => setHowItWorks({...howItWorks, steps: howItWorks.steps.map(s => s.id === step.id ? {...s, description: e.target.value} : s)})} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-[#9ca3af] text-sm outline-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold">Stats / Numbers Section</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={stats.enabled} onChange={(e) => setStats({...stats, enabled: e.target.checked})} className="sr-only peer" />
            <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.items.map((item) => (
              <div key={item.id} className="p-4 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-center">
                <input type="text" value={item.value} onChange={(e) => setStats({...stats, items: stats.items.map(i => i.id === item.id ? {...i, value: e.target.value} : i)})} className="w-full text-center text-2xl font-bold text-[#10b981] bg-transparent outline-none border-b border-transparent focus:border-[#10b981]" />
                <input type="text" value={item.label} onChange={(e) => setStats({...stats, items: stats.items.map(i => i.id === item.id ? {...i, label: e.target.value} : i)})} className="w-full text-center text-sm text-[#9ca3af] bg-transparent outline-none mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
