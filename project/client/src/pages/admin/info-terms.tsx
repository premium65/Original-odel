import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollText, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminInfoTerms() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState({
    title: "Terms & Conditions",
    content: "",
    isActive: true
  });

  const { data: pages = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/settings/pages"],
  });

  useEffect(() => {
    const termsPage = pages.find(p => p.type === "terms");
    if (termsPage) {
      setContent({
        title: termsPage.title || "Terms & Conditions",
        content: termsPage.content || "",
        isActive: termsPage.isActive ?? true
      });
    }
  }, [pages]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof content) => {
      const res = await fetch("/api/admin/settings/pages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "terms", ...data }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/pages"] });
      toast({ title: "Success", description: "Terms & Conditions saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save Terms & Conditions", variant: "destructive" });
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
          <h1 className="text-3xl font-bold text-white">Terms & Conditions</h1>
          <p className="text-[#9ca3af] mt-1">Edit your Terms & Conditions page</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2a3a4d] text-white rounded-xl hover:bg-[#3a4a5d] transition-colors"
          >
            <Eye className="w-5 h-5" />
            <span className="font-medium">Preview</span>
          </a>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] text-white rounded-xl hover:bg-[#059669] transition-colors"
          >
            <Save className="w-5 h-5" />
            <span className="font-medium">{saveMutation.isPending ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center">
              <ScrollText className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Page Content</h2>
          </div>
        </div>
        
        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Page Title</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              placeholder="Terms & Conditions"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Content (HTML supported)</label>
            <textarea
              value={content.content}
              onChange={(e) => setContent({ ...content, content: e.target.value })}
              placeholder="Write your Terms & Conditions here..."
              rows={15}
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none resize-none font-mono text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={content.isActive}
                onChange={(e) => setContent({ ...content, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-[#2a3a4d] bg-[#0f1419] text-[#10b981] focus:ring-[#10b981]"
              />
              <span className="text-white">Page is published</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
