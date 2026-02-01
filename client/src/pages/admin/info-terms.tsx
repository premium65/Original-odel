import { useState, useEffect } from "react";
import { FileCheck, Save, Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Section {
  id: number;
  title: string;
  content: string;
}

interface TermsContent {
  pageTitle: string;
  lastUpdated: string;
  sections: Section[];
}

export default function InfoTerms() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [content, setContent] = useState<TermsContent>({
    pageTitle: "Terms & Conditions",
    lastUpdated: new Date().toISOString().split('T')[0],
    sections: [
      { id: 1, title: "Acceptance of Terms", content: "By accessing and using ODEL-ADS, you accept and agree to be bound by the terms and provisions of this agreement." },
      { id: 2, title: "User Accounts", content: "You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials." },
    ],
  });

  const { data: pageData, isLoading } = useQuery({
    queryKey: ["admin-info-page", "terms"],
    queryFn: () => api.getInfoPage("terms"),
  });

  useEffect(() => {
    if (pageData?.content) {
      try {
        const parsed = JSON.parse(pageData.content);
        setContent(prev => ({ ...prev, ...parsed }));
      } catch {
        if (pageData.title) setContent(prev => ({ ...prev, pageTitle: pageData.title }));
      }
    }
  }, [pageData]);

  const mutation = useMutation({
    mutationFn: (data: { title: string; content: string }) => api.updateInfoPage("terms", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-info-page", "terms"] });
      toast({ title: "Terms & Conditions saved!" });
    },
    onError: () => {
      toast({ title: "Failed to save content", variant: "destructive" });
    },
  });

  const handleSave = () => {
    mutation.mutate({
      title: content.pageTitle,
      content: JSON.stringify(content),
    });
  };

  const addSection = () => {
    setContent({
      ...content,
      sections: [...content.sections, { id: Date.now(), title: "New Section", content: "" }],
    });
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
          disabled={mutation.isPending}
          className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save
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
              <input type="text" value={content.pageTitle} onChange={(e) => setContent({ ...content, pageTitle: e.target.value })} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Last Updated</label>
              <input type="date" value={content.lastUpdated} onChange={(e) => setContent({ ...content, lastUpdated: e.target.value })} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
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
            {content.sections.map((section, index) => (
              <div key={section.id} className="p-4 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <GripVertical className="h-5 w-5 text-[#6b7280] cursor-move" />
                  <span className="text-[#f59e0b] font-bold">{index + 1}.</span>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => setContent({
                      ...content,
                      sections: content.sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s),
                    })}
                    className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white font-semibold outline-none"
                  />
                  <button
                    onClick={() => setContent({
                      ...content,
                      sections: content.sections.filter(s => s.id !== section.id),
                    })}
                    className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  value={section.content}
                  onChange={(e) => setContent({
                    ...content,
                    sections: content.sections.map(s => s.id === section.id ? { ...s, content: e.target.value } : s),
                  })}
                  className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none resize-none"
                  rows={3}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
