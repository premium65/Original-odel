import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Save, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminContactTelegram() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [telegram, setTelegram] = useState({
    username: "",
    channelLink: "",
    isActive: true
  });

  const { data: settings = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/settings/contact"],
  });

  useEffect(() => {
    const tgSetting = settings.find(s => s.type === "telegram");
    if (tgSetting) {
      setTelegram({
        username: tgSetting.value || "",
        channelLink: tgSetting.label || "",
        isActive: tgSetting.isActive ?? true
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof telegram) => {
      const res = await fetch("/api/admin/settings/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "telegram", 
          items: [{ 
            type: "telegram", 
            value: data.username, 
            label: data.channelLink,
            isActive: data.isActive 
          }] 
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/contact"] });
      toast({ title: "Success", description: "Telegram settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save Telegram settings", variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(telegram);
  };

  const telegramUrl = telegram.username 
    ? `https://t.me/${telegram.username.replace('@', '')}`
    : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Telegram</h1>
          <p className="text-[#9ca3af] mt-1">Configure Telegram contact options</p>
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
            <div className="w-10 h-10 rounded-xl bg-[#0088CC]/20 flex items-center justify-center">
              <Send className="w-5 h-5 text-[#0088CC]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Telegram Settings</h2>
          </div>
        </div>
        
        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Support Username</label>
            <input
              type="text"
              value={telegram.username}
              onChange={(e) => setTelegram({ ...telegram, username: e.target.value })}
              placeholder="@username"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
            <p className="text-xs text-[#6b7280] mt-1">Your Telegram username for direct contact</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Channel/Group Link (Optional)</label>
            <input
              type="text"
              value={telegram.channelLink}
              onChange={(e) => setTelegram({ ...telegram, channelLink: e.target.value })}
              placeholder="https://t.me/yourchannel"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
            />
            <p className="text-xs text-[#6b7280] mt-1">Link to your public channel or group</p>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={telegram.isActive}
                onChange={(e) => setTelegram({ ...telegram, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-[#2a3a4d] bg-[#0f1419] text-[#10b981] focus:ring-[#10b981]"
              />
              <span className="text-white">Enable Telegram button on site</span>
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
        {telegram.isActive && telegram.username ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-[#0088CC] text-white rounded-xl hover:bg-[#0077B3] transition-colors"
              >
                <Send className="w-6 h-6" />
                <span className="font-medium">Contact on Telegram</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              {telegram.channelLink && (
                <a
                  href={telegram.channelLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-[#2a3a4d] text-white rounded-xl hover:bg-[#3a4a5d] transition-colors"
                >
                  <Send className="w-6 h-6" />
                  <span className="font-medium">Join Channel</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ) : (
          <p className="text-[#6b7280] text-center py-4">
            {!telegram.isActive ? "Telegram button is disabled" : "Enter a username to see preview"}
          </p>
        )}
      </div>
    </div>
  );
}
