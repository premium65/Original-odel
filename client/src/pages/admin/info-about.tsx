import { useState, useEffect } from "react";
import { Info, Save, Plus, Trash2, Image } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AboutContent {
  title: string;
  subtitle: string;
  heroImage: string;
  mission: string;
  vision: string;
  story: string;
  showTeam: boolean;
  teamTitle: string;
  team: { id: number; name: string; role: string; image: string }[];
}

export default function InfoAbout() {
  const { toast } = useToast();
  const [content, setContent] = useState<AboutContent>({
    title: "About Us",
    subtitle: "Learn more about ODEL-ADS",
    heroImage: "",
    mission: "Our mission is to provide a platform where users can earn money by watching and interacting with advertisements.",
    vision: "We envision a world where anyone can earn supplementary income through simple online activities.",
    story: "ODEL-ADS was founded in 2024 with the goal of creating a fair and transparent advertising platform.",
    showTeam: true,
    teamTitle: "Our Team",
    team: []
  });

  const { data: savedContent, isLoading } = useQuery({
    queryKey: ["/api/admin/settings/content/about"],
  });

  useEffect(() => {
    if (savedContent && Array.isArray(savedContent) && savedContent.length > 0) {
      try {
        const parsed = savedContent[0].metadata ? JSON.parse(savedContent[0].metadata) : {};
        setContent({
          title: savedContent[0].title || "About Us",
          subtitle: parsed.subtitle || "Learn more about ODEL-ADS",
          heroImage: parsed.heroImage || "",
          mission: parsed.mission || "",
          vision: parsed.vision || "",
          story: savedContent[0].content || "",
          showTeam: parsed.showTeam ?? true,
          teamTitle: parsed.teamTitle || "Our Team",
          team: parsed.team || []
        });
      } catch (e) {
        console.error("Error parsing about content:", e);
      }
    }
  }, [savedContent]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", "/api/admin/settings/content/about", {
        section: "main",
        title: content.title,
        content: content.story,
        metadata: JSON.stringify({
          subtitle: content.subtitle,
          heroImage: content.heroImage,
          mission: content.mission,
          vision: content.vision,
          showTeam: content.showTeam,
          teamTitle: content.teamTitle,
          team: content.team
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/content/about"] });
      toast({ title: "Success", description: "About Us content saved!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save content", variant: "destructive" });
    }
  });

  const handleSave = () => saveMutation.mutate();

  const addTeamMember = () => {
    setContent({
      ...content,
      team: [...content.team, { id: Date.now(), name: "", role: "", image: "" }]
    });
  };

  const removeTeamMember = (id: number) => {
    setContent({
      ...content,
      team: content.team.filter(t => t.id !== id)
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b82f6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center">
            <Info className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">About Us Page</h1>
            <p className="text-[#9ca3af]">Edit the About Us page content</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-5 w-5" /> {saveMutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold">Page Header</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Page Title</label>
                <input type="text" value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Subtitle</label>
                <input type="text" value={content.subtitle} onChange={(e) => setContent({ ...content, subtitle: e.target.value })} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold">Mission & Vision</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Our Mission</label>
                <textarea value={content.mission} onChange={(e) => setContent({ ...content, mission: e.target.value })} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none resize-none" rows={3} />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Our Vision</label>
                <textarea value={content.vision} onChange={(e) => setContent({ ...content, vision: e.target.value })} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none resize-none" rows={3} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold">Our Story</h3>
            </div>
            <div className="p-6">
              <textarea value={content.story} onChange={(e) => setContent({ ...content, story: e.target.value })} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none resize-none" rows={8} />
            </div>
          </div>

          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold">Team Section</h3>
              <div className="flex items-center gap-3">
                <button onClick={addTeamMember} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={content.showTeam} onChange={(e) => setContent({ ...content, showTeam: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {content.team.length === 0 ? (
                <p className="text-center text-[#6b7280] py-4">No team members added. Click "Add" to create one.</p>
              ) : (
                content.team.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 p-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-[#2a3a4d] flex items-center justify-center">
                      <Image className="h-5 w-5 text-[#6b7280]" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input type="text" value={member.name} onChange={(e) => setContent({ ...content, team: content.team.map(t => t.id === member.id ? { ...t, name: e.target.value } : t) })} className="px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" placeholder="Name" />
                      <input type="text" value={member.role} onChange={(e) => setContent({ ...content, team: content.team.map(t => t.id === member.id ? { ...t, role: e.target.value } : t) })} className="px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" placeholder="Role" />
                    </div>
                    <button onClick={() => removeTeamMember(member.id)} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
