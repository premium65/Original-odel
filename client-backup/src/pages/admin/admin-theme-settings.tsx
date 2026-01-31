import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Palette, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const defaultTheme = {
  // Background colors
  bgPrimary: "#0f1419",
  bgSecondary: "#1a2332",
  bgCard: "#1a2332",
  bgHover: "#2a3a4d",
  // Text colors
  textPrimary: "#ffffff",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",
  // Brand colors
  primary: "#10b981",
  primaryHover: "#059669",
  accent: "#8b5cf6",
  accentHover: "#7c3aed",
  // Status colors
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#0ea5e9",
  // Border colors
  borderPrimary: "#2a3a4d",
  borderSecondary: "#334155",
  // Gradient colors
  gradientStart: "#8b5cf6",
  gradientEnd: "#6366f1"
};

export default function AdminThemeSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState(defaultTheme);

  const { data: settings = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/settings/theme"],
  });

  useEffect(() => {
    const themeSetting = settings.find(s => s.type === "theme");
    if (themeSetting?.data) {
      setTheme({ ...defaultTheme, ...themeSetting.data });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof theme) => {
      const res = await fetch("/api/admin/settings/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "theme", data }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/theme"] });
      toast({ title: "Success", description: "Theme colors saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save theme colors", variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(theme);
  };

  const handleReset = () => {
    setTheme(defaultTheme);
    toast({ title: "Reset", description: "Theme reset to defaults" });
  };

  const ColorInput = ({ label, value, onChange, description }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void;
    description?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#9ca3af]">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-24 px-2 py-1 bg-[#0f1419] border border-[#2a3a4d] rounded text-white text-sm font-mono focus:border-[#10b981] focus:outline-none"
          />
        </div>
      </div>
      {description && <p className="text-xs text-[#6b7280]">{description}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Theme Colors</h1>
          <p className="text-[#9ca3af] mt-1">Customize the color scheme of your site</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2a3a4d] text-white rounded-xl hover:bg-[#3a4a5d] transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="font-medium">Reset</span>
          </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Background Colors */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
          <div className="p-5 border-b border-[#2a3a4d]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
                <Palette className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <h2 className="text-lg font-semibold text-white">Background Colors</h2>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <ColorInput 
              label="Primary Background" 
              value={theme.bgPrimary} 
              onChange={(v) => setTheme({ ...theme, bgPrimary: v })}
              description="Main page background"
            />
            <ColorInput 
              label="Secondary Background" 
              value={theme.bgSecondary} 
              onChange={(v) => setTheme({ ...theme, bgSecondary: v })}
              description="Sidebar, header background"
            />
            <ColorInput 
              label="Card Background" 
              value={theme.bgCard} 
              onChange={(v) => setTheme({ ...theme, bgCard: v })}
              description="Card and panel background"
            />
            <ColorInput 
              label="Hover Background" 
              value={theme.bgHover} 
              onChange={(v) => setTheme({ ...theme, bgHover: v })}
              description="Hover state background"
            />
          </div>
        </div>

        {/* Text Colors */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
          <div className="p-5 border-b border-[#2a3a4d]">
            <h2 className="text-lg font-semibold text-white">Text Colors</h2>
          </div>
          <div className="p-5 space-y-4">
            <ColorInput 
              label="Primary Text" 
              value={theme.textPrimary} 
              onChange={(v) => setTheme({ ...theme, textPrimary: v })}
              description="Headings and main text"
            />
            <ColorInput 
              label="Secondary Text" 
              value={theme.textSecondary} 
              onChange={(v) => setTheme({ ...theme, textSecondary: v })}
              description="Body text and labels"
            />
            <ColorInput 
              label="Muted Text" 
              value={theme.textMuted} 
              onChange={(v) => setTheme({ ...theme, textMuted: v })}
              description="Helper text and placeholders"
            />
          </div>
        </div>

        {/* Brand Colors */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
          <div className="p-5 border-b border-[#2a3a4d]">
            <h2 className="text-lg font-semibold text-white">Brand Colors</h2>
          </div>
          <div className="p-5 space-y-4">
            <ColorInput 
              label="Primary Color" 
              value={theme.primary} 
              onChange={(v) => setTheme({ ...theme, primary: v })}
              description="Main brand color (buttons, links)"
            />
            <ColorInput 
              label="Primary Hover" 
              value={theme.primaryHover} 
              onChange={(v) => setTheme({ ...theme, primaryHover: v })}
              description="Primary color hover state"
            />
            <ColorInput 
              label="Accent Color" 
              value={theme.accent} 
              onChange={(v) => setTheme({ ...theme, accent: v })}
              description="Secondary brand color"
            />
            <ColorInput 
              label="Accent Hover" 
              value={theme.accentHover} 
              onChange={(v) => setTheme({ ...theme, accentHover: v })}
              description="Accent color hover state"
            />
          </div>
        </div>

        {/* Status Colors */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
          <div className="p-5 border-b border-[#2a3a4d]">
            <h2 className="text-lg font-semibold text-white">Status Colors</h2>
          </div>
          <div className="p-5 space-y-4">
            <ColorInput 
              label="Success" 
              value={theme.success} 
              onChange={(v) => setTheme({ ...theme, success: v })}
              description="Success messages and indicators"
            />
            <ColorInput 
              label="Warning" 
              value={theme.warning} 
              onChange={(v) => setTheme({ ...theme, warning: v })}
              description="Warning messages"
            />
            <ColorInput 
              label="Error" 
              value={theme.error} 
              onChange={(v) => setTheme({ ...theme, error: v })}
              description="Error messages"
            />
            <ColorInput 
              label="Info" 
              value={theme.info} 
              onChange={(v) => setTheme({ ...theme, info: v })}
              description="Info messages"
            />
          </div>
        </div>

        {/* Border & Gradient Colors */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-[#2a3a4d]">
            <h2 className="text-lg font-semibold text-white">Border & Gradient Colors</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ColorInput 
              label="Primary Border" 
              value={theme.borderPrimary} 
              onChange={(v) => setTheme({ ...theme, borderPrimary: v })}
            />
            <ColorInput 
              label="Secondary Border" 
              value={theme.borderSecondary} 
              onChange={(v) => setTheme({ ...theme, borderSecondary: v })}
            />
            <ColorInput 
              label="Gradient Start" 
              value={theme.gradientStart} 
              onChange={(v) => setTheme({ ...theme, gradientStart: v })}
            />
            <ColorInput 
              label="Gradient End" 
              value={theme.gradientEnd} 
              onChange={(v) => setTheme({ ...theme, gradientEnd: v })}
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white">Preview</h2>
        </div>
        <div className="p-5" style={{ backgroundColor: theme.bgPrimary }}>
          <div className="p-6 rounded-xl" style={{ backgroundColor: theme.bgCard, borderColor: theme.borderPrimary, borderWidth: 1 }}>
            <h3 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>Sample Card</h3>
            <p className="mb-4" style={{ color: theme.textSecondary }}>This is how your content will look with the selected colors.</p>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: theme.primary, color: '#fff' }}>
                Primary Button
              </button>
              <button className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: theme.accent, color: '#fff' }}>
                Accent Button
              </button>
            </div>
            <div className="flex gap-3 mt-4">
              <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: `${theme.success}33`, color: theme.success }}>Success</span>
              <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: `${theme.warning}33`, color: theme.warning }}>Warning</span>
              <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: `${theme.error}33`, color: theme.error }}>Error</span>
              <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: `${theme.info}33`, color: theme.info }}>Info</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
