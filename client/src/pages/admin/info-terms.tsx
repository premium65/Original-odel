import { useState, useEffect } from "react";
import { FileCheck, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Section {
  id: number;
  title: string;
  content: string;
}

export default function InfoTerms() {
  const { toast } = useToast();
  const [pageTitle, setPageTitle] = useState("Terms & Conditions");
  const [lastUpdated, setLastUpdated] = useState("2024-01-15");
  const [sections, setSections] = useState<Section[]>([
    { id: 1, title: "Acceptance of Terms", content: "By accessing and using ODEL-ADS, you accept and agree to be bound by the terms and provisions of this agreement." },
    { id: 2, title: "User Accounts", content: "You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials." },
    { id: 3, title: "Earnings and Payments", content: "Users earn money by watching and interacting with advertisements. Minimum withdrawal amount is LKR 500. Payments are processed within 7 business days." },
    { id: 4, title: "Prohibited Activities", content: "Users may not use automated tools, create multiple accounts, or engage in fraudulent activities. Violations will result in account termination." },
  ]);

  const { data: savedContent, isLoading } = useQuery({
    queryKey: ["/api/admin/settings/content/terms"],
  });

  useEffect(() => {
    if (savedContent && Array.isArray(savedContent) && savedContent.length > 0) {
      try {
        const parsed = savedContent[0].metadata ? JSON.parse(savedContent[0].metadata) : {};
        setPageTitle(savedContent[0].title || "Terms & Conditions");
        setLastUpdated(parsed.lastUpdated || "2024-01-15");
        if (parsed.sections) {
          setSections(parsed.sections);
        }
      } catch (e) {
        console.error("Error parsing terms content:", e);
      }
    }
  }, [savedContent]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", "/api/admin/settings/content/terms", {
        section: "main",
        title: pageTitle,
        content: sections.map(s => `${s.title}: ${s.content}`).join("\n\n"),
        metadata: JSON.stringify({
          lastUpdated,
          sections
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/content/terms"] });
      toast({ title: "Success", description: "Terms & Conditions saved!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save content", variant: "destructive" });
    }
  });

  const handleSave = () => saveMutation.mutate();

  const addSection = () => {
    setSections([...sections, { id: Date.now(), title: "New Section", content: "" }]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f59e0b]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center">
            <FileCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Terms & Conditions</h1>
            <p className="text-[#9ca3af]">Edit terms and conditions content</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
          <div className="px-6 py-4 border-b border-[#2a3a4d]">
            <h3 className="text-white font-semibold">Page Settings</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Page Title</label>
              <input type="text" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Last Updated</label>
              <input type="date" value={lastUpdated} onChange={(e) => setLastUpdated(e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
            <h3 className="text-white font-semibold">Content Sections</h3>
            <button onClick={addSection} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Section
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {sections.map((section, index) => (
              <div key={section.id} className="p-4 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <GripVertical className="h-5 w-5 text-[#6b7280] cursor-move" />
                  <span className="text-[#f59e0b] font-bold">{index + 1}.</span>
                  <input type="text" value={section.title} onChange={(e) => setSections(sections.map(s => s.id === section.id ? {...s, title: e.target.value} : s))} className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white font-semibold outline-none" />
                  <button onClick={() => setSections(sections.filter(s => s.id !== section.id))} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea value={section.content} onChange={(e) => setSections(sections.map(s => s.id === section.id ? {...s, content: e.target.value} : s))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none resize-none" rows={3} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
