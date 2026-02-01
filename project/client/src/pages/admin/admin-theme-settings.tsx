import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Palette, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminThemeSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState({
    primaryColor: "#8b5cf6",
    secondaryColor: "#10b981",
    backgroundColor: "#0f1419",
    cardColor: "#1a2332",
    borderColor: "#2a3a4d",
    textColor: "#ffffff",
    mutedColor: "#9ca3af",
    accentColor: "#f59e0b",
    dangerColor: "#ef4444",
    successColor: "#22c55e",
  });

  const { data: settings = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/settings/theme"],
  });

  useEffect(() => {
    const themeSetting = settings.find(s => s.type === "theme");
    if (themeSetting?.data) {
      setTheme({ ...theme, ...themeSetting.data });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof theme) => {
      const res = await fetch("/api/admin/settings/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "theme", data }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/theme"] });
      toast({ title: "Success", description: "Theme settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save theme settings", variant: "destructive" });
    },
  });

  const handleSave = () => saveMutation.mutate(theme);

  const colorFields = [
    { key: "primaryColor", label: "Primary Color", description: "Main brand color" },
    { key: "secondaryColor", label: "Secondary Color", description: "Accent color" },
    { key: "backgroundColor", label: "Background", description: "Page background" },
    { key: "cardColor", label: "Card Background", description: "Card and panel background" },
    { key: "borderColor", label: "Border Color", description: "Borders and dividers" },
    { key: "textColor", label: "Text Color", description: "Primary text" },
    { key: "mutedColor", label: "Muted Text", description: "Secondary text" },
    { key: "accentColor", label: "Accent Color", description: "Highlights" },
    { key: "dangerColor", label: "Danger Color", description: "Errors and warnings" },
    { key: "successColor", label: "Success Color", description: "Success states" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Palette className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Theme Colors</h1>
            <p className="text-gray-400">Customize your site's color scheme</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-600 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colorFields.map(({ key, label, description }) => (
          <div key={key} className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg border-2 border-[#2a3a4d]"
                style={{ backgroundColor: (theme as any)[key] }}
              />
              <div>
                <p className="text-white font-medium">{label}</p>
                <p className="text-gray-500 text-sm">{description}</p>
              </div>
            </div>
            <input
              type="color"
              value={(theme as any)[key]}
              onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={(theme as any)[key]}
              onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
              className="w-full mt-2 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm"
            />
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>
        <div className="p-4 rounded-xl" style={{ backgroundColor: theme.backgroundColor }}>
          <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: theme.cardColor, borderColor: theme.borderColor, borderWidth: 1 }}>
            <h3 style={{ color: theme.textColor }}>Sample Card</h3>
            <p style={{ color: theme.mutedColor }}>This is how your cards will look</p>
            <div className="flex gap-2 mt-3">
              <button className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: theme.primaryColor }}>Primary</button>
              <button className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: theme.secondaryColor }}>Secondary</button>
              <button className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: theme.dangerColor }}>Danger</button>
              <button className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: theme.successColor }}>Success</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
