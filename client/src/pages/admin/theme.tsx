import { useState } from "react";
import { Palette, Save, RotateCcw } from "lucide-react";

export default function Theme() {
  const [colors, setColors] = useState({
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
  });

  const defaultColors = {
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

  const handleSave = () => alert("Theme colors saved!");
  const handleReset = () => setColors(defaultColors);

  const colorGroups = [
    { title: "Brand Colors", colors: ["primary", "secondary", "accent"] },
    { title: "Background Colors", colors: ["background", "cardBackground", "border"] },
    { title: "Text Colors", colors: ["textPrimary", "textSecondary", "textMuted"] },
    { title: "Status Colors", colors: ["success", "warning", "error", "info"] },
  ];

  const colorLabels: Record<string, string> = {
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
          <button onClick={handleSave} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
            <Save className="h-5 w-5" /> Save
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
                    value={colors[colorKey as keyof typeof colors]} 
                    onChange={(e) => setColors({...colors, [colorKey]: e.target.value})} 
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <div className="flex-1">
                    <label className="block text-white text-sm font-medium">{colorLabels[colorKey]}</label>
                    <input 
                      type="text" 
                      value={colors[colorKey as keyof typeof colors]} 
                      onChange={(e) => setColors({...colors, [colorKey]: e.target.value})} 
                      className="w-full mt-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none"
                    />
                  </div>
                  <div 
                    className="w-24 h-12 rounded-lg border border-[#2a3a4d]"
                    style={{ backgroundColor: colors[colorKey as keyof typeof colors] }}
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
