import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Save, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminContactWhatsApp() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [whatsapp, setWhatsapp] = useState({
    number: "",
    message: "Hello! I need help with...",
    isActive: true
  });

  const { data: settings = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/settings/contact"],
  });

  useEffect(() => {
    const waSetting = settings.find(s => s.type === "whatsapp");
    if (waSetting) {
      setWhatsapp({
        number: waSetting.value || "",
        message: waSetting.label || "Hello! I need help with...",
        isActive: waSetting.isActive ?? true
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof whatsapp) => {
      const res = await fetch("/api/admin/settings/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "whatsapp", 
          items: [{ 
            type: "whatsapp", 
            value: data.number, 
            label: data.message,
            isActive: data.isActive 
          }] 
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/contact"] });
      toast({ title: "Success", description: "WhatsApp settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save WhatsApp settings", variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(whatsapp);
  };

  const whatsappUrl = whatsapp.number 
    ? `https://wa.me/${whatsapp.number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsapp.message)}`
    : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">WhatsApp</h1>
          <p className="text-[#9ca3af] mt-1">Configure WhatsApp contact button</p>
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

      {/* Settings */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
            </div>
            <h2 className="text-lg font-semibold text-white">WhatsApp Settings</h2>
          </div>
        </div>
        
        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Phone Number (with country code)</label>
            <input
              type="tel"
              value={whatsapp.number}
              onChange={(e) => setWhatsapp({ ...whatsapp, number: e.target.value })}
              placeholder="+94771234567"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
            <p className="text-xs text-[#6b7280] mt-1">Include country code without spaces or dashes (e.g., +94771234567)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Default Message</label>
            <textarea
              value={whatsapp.message}
              onChange={(e) => setWhatsapp({ ...whatsapp, message: e.target.value })}
              placeholder="Hello! I need help with..."
              rows={3}
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none resize-none"
            />
            <p className="text-xs text-[#6b7280] mt-1">Pre-filled message when user clicks WhatsApp button</p>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsapp.isActive}
                onChange={(e) => setWhatsapp({ ...whatsapp, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-[#2a3a4d] bg-[#0f1419] text-[#10b981] focus:ring-[#10b981]"
              />
              <span className="text-white">Enable WhatsApp button on site</span>
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
        {whatsapp.isActive && whatsapp.number ? (
          <div className="space-y-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-[#25D366] text-white rounded-xl hover:bg-[#20BD5C] transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="font-medium">Chat on WhatsApp</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-[#6b7280] text-sm">
              Link: <span className="text-[#9ca3af] break-all">{whatsappUrl}</span>
            </p>
          </div>
        ) : (
          <p className="text-[#6b7280] text-center py-4">
            {!whatsapp.isActive ? "WhatsApp button is disabled" : "Enter a phone number to see preview"}
          </p>
        )}
      </div>
    </div>
  );
}
