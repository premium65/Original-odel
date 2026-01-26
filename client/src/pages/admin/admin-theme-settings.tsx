import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ColorSetting {
  key: string;
  value: string;
  label: string;
  description: string;
}

const defaultColors: ColorSetting[] = [
  { key: "primary_color", value: "#f59e0b", label: "Primary Color", description: "Main accent color" },
  { key: "secondary_color", value: "#1a1a2e", label: "Secondary Color", description: "Background color" },
  { key: "accent_color", value: "#16213e", label: "Accent Color", description: "Accent highlights" },
  { key: "text_color", value: "#ffffff", label: "Text Color", description: "Main text color" },
  { key: "nav_bg_color", value: "#000000", label: "Navigation Background", description: "Top nav bar" },
  { key: "footer_bg_color", value: "#111827", label: "Footer Background", description: "Footer section" },
  { key: "card_bg_color", value: "#1f2937", label: "Card Background", description: "Cards and panels" },
  { key: "button_color", value: "#f59e0b", label: "Button Color", description: "Primary buttons" },
  { key: "button_hover_color", value: "#d97706", label: "Button Hover", description: "Button hover state" },
];

export default function AdminThemeSettings() {
  const [colors, setColors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings) {
      setColors(settings);
    } else {
      const defaults: Record<string, string> = {};
      defaultColors.forEach(c => { defaults[c.key] = c.value; });
      setColors(defaults);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (colorSettings: { key: string; value: string }[]) => {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ settings: colorSettings }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Theme colors saved!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save colors", variant: "destructive" });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/settings/reset", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reset");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Theme reset to defaults!" });
    },
  });

  const handleSave = () => {
    const colorSettings = Object.entries(colors).map(([key, value]) => ({ key, value }));
    saveMutation.mutate(colorSettings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-red-600">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Theme Colors</h1>
            <p className="text-gray-400">Customize site colors and appearance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => resetMutation.mutate()} className="border-gray-600 text-gray-300">
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-rose-500 to-red-600">
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {defaultColors.map((colorDef) => (
          <Card key={colorDef.key} className="bg-[#1a1a2e] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-gray-600"
                  style={{ backgroundColor: colors[colorDef.key] || colorDef.value }}
                />
                <div>
                  <p className="text-white font-medium">{colorDef.label}</p>
                  <p className="text-gray-500 text-xs">{colorDef.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colors[colorDef.key] || colorDef.value}
                  onChange={(e) => setColors({ ...colors, [colorDef.key]: e.target.value })}
                  className="w-12 h-10 p-1 bg-transparent border-gray-600 cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors[colorDef.key] || colorDef.value}
                  onChange={(e) => setColors({ ...colors, [colorDef.key]: e.target.value })}
                  className="flex-1 bg-[#16213e] border-gray-600 text-white font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg" style={{ backgroundColor: colors.secondary_color || '#1a1a2e' }}>
            <div className="p-3 rounded mb-3" style={{ backgroundColor: colors.nav_bg_color || '#000' }}>
              <span style={{ color: colors.text_color || '#fff' }}>Navigation Bar</span>
            </div>
            <div className="p-4 rounded mb-3" style={{ backgroundColor: colors.card_bg_color || '#1f2937' }}>
              <p style={{ color: colors.text_color || '#fff' }}>Sample Card Content</p>
              <button className="mt-2 px-4 py-2 rounded" style={{ backgroundColor: colors.button_color || '#f59e0b', color: '#000' }}>
                Button
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
