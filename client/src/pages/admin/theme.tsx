import { useState, useEffect } from "react";
import { Palette, Save, RotateCcw, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBackground: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

const defaultColors: ThemeColors = {
  primary: "#f59e0b",
  secondary: "#10b981",
  accent: "#3b82f6",
  background: "#0f1419",
  cardBackground: "#1a2332",
  border: "#2a3a4d",
  textPrimary: "#ffffff",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
};

export default function Theme() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [colors, setColors] = useState<ThemeColors>(defaultColors);

  const { data: themeData, isLoading } = useQuery({
    queryKey: ["admin-theme"],
    queryFn: api.getTheme,
  });

  useEffect(() => {
    if (themeData) {
      // Convert from { key: { value } } to { key: value }
      const themeColors: Partial<ThemeColors> = {};
      Object.entries(themeData).forEach(([key, data]: [string, any]) => {
        themeColors[key as keyof ThemeColors] = data?.value || data;
      });
      setColors(prev => ({ ...prev, ...themeColors }));
    }
  }, [themeData]);

  const mutation = useMutation({
    mutationFn: api.updateTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-theme"] });
      toast({ title: "Theme colors saved!" });
    },
    onError: () => {
      toast({ title: "Failed to save theme colors", variant: "destructive" });
    },
  });

  const handleSave = () => {
    mutation.mutate(colors);
  };

  const handleReset = () => {
    setColors(defaultColors);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#ec4899]" />
      </div>
    );
  }

  const colorGroups = [
    { title: "Brand Colors", colors: ["primary", "secondary", "accent"] as const },
    { title: "Background Colors", colors: ["background", "cardBackground", "border"] as const },
    { title: "Text Colors", colors: ["textPrimary", "textSecondary", "textMuted"] as const },
    { title: "Status Colors", colors: ["success", "warning", "error", "info"] as const },
  ];

  const colorLabels: Record<keyof ThemeColors, string> = {
    primary: "Primary (Orange)",
    secondary: "Secondary (Green)",
    accent: "Accent (Blue)",
    background: "Background",
    cardBackground: "Card Background",
    border: "Border",
    textPrimary: "Primary Text",
    textSecondary: "Secondary Text",
    textMuted: "Muted Text",
    success: "Success",
    warning: "Warning",
    error: "Error",
    info: "Info",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] flex items-center justify-center">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Theme Colors</h1>
            <p className="text-[#9ca3af]">Customize the color scheme</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset} className="px-5 py-2.5 bg-[#1a2332] border border-[#2a3a4d] text-white font-medium rounded-xl flex items-center gap-2 hover:bg-[#2a3a4d]">
            <RotateCcw className="h-5 w-5" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {colorGroups.map((group) => (
          <div key={group.title} className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold">{group.title}</h3>
            </div>
            <div className="p-6 space-y-4">
              {group.colors.map((colorKey) => (
                <div key={colorKey} className="flex items-center gap-4">
                  <input
                    type="color"
                    value={colors[colorKey]}
                    onChange={(e) => setColors({...colors, [colorKey]: e.target.value})}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <div className="flex-1">
                    <label className="block text-white text-sm font-medium">{colorLabels[colorKey]}</label>
                    <input
                      type="text"
                      value={colors[colorKey]}
                      onChange={(e) => setColors({...colors, [colorKey]: e.target.value})}
                      className="w-full mt-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none"
                    />
                  </div>
                  <div
                    className="w-24 h-12 rounded-lg border border-[#2a3a4d]"
                    style={{ backgroundColor: colors[colorKey] }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold">Preview</h3>
        </div>
        <div className="p-6">
          <div className="rounded-xl p-6" style={{ backgroundColor: colors.background }}>
            <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 }}>
              <h4 className="font-bold mb-2" style={{ color: colors.textPrimary }}>Card Title</h4>
              <p className="text-sm" style={{ color: colors.textSecondary }}>This is secondary text content.</p>
              <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Muted text example</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: colors.primary }}>Primary</button>
              <button className="px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: colors.secondary }}>Secondary</button>
              <button className="px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: colors.accent }}>Accent</button>
            </div>
            <div className="flex gap-3 mt-4">
              <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: colors.success }}>Success</span>
              <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: colors.warning }}>Warning</span>
              <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: colors.error }}>Error</span>
              <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: colors.info }}>Info</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
