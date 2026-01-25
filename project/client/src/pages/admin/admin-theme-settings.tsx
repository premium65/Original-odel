import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Palette, Save, RotateCcw, Eye, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

interface SiteSetting {
  id: number;
  settingKey: string;
  settingValue: string;
  settingType: string;
  category: string;
  label: string | null;
  description: string | null;
}

interface ColorPreset {
  name: string;
  colors: Record<string, string>;
}

const colorPresets: ColorPreset[] = [
  {
    name: "Amber Gold (Default)",
    colors: {
      primary_color: "#f59e0b",
      secondary_color: "#1a1a2e",
      accent_color: "#16213e",
      text_color: "#ffffff",
      nav_bg_color: "#000000",
      footer_bg_color: "#111827",
      card_bg_color: "#1f2937",
      button_color: "#f59e0b",
      button_hover_color: "#d97706",
      marquee_bg_color: "#f59e0b",
      marquee_text_color: "#000000",
    },
  },
  {
    name: "Royal Purple",
    colors: {
      primary_color: "#8b5cf6",
      secondary_color: "#1e1b4b",
      accent_color: "#312e81",
      text_color: "#ffffff",
      nav_bg_color: "#0f0a1e",
      footer_bg_color: "#1e1b4b",
      card_bg_color: "#312e81",
      button_color: "#8b5cf6",
      button_hover_color: "#7c3aed",
      marquee_bg_color: "#8b5cf6",
      marquee_text_color: "#ffffff",
    },
  },
  {
    name: "Ocean Blue",
    colors: {
      primary_color: "#0ea5e9",
      secondary_color: "#0c1929",
      accent_color: "#164e63",
      text_color: "#ffffff",
      nav_bg_color: "#0a1929",
      footer_bg_color: "#0c1929",
      card_bg_color: "#164e63",
      button_color: "#0ea5e9",
      button_hover_color: "#0284c7",
      marquee_bg_color: "#0ea5e9",
      marquee_text_color: "#ffffff",
    },
  },
  {
    name: "Emerald Green",
    colors: {
      primary_color: "#10b981",
      secondary_color: "#0a1f1a",
      accent_color: "#065f46",
      text_color: "#ffffff",
      nav_bg_color: "#0a1612",
      footer_bg_color: "#0a1f1a",
      card_bg_color: "#065f46",
      button_color: "#10b981",
      button_hover_color: "#059669",
      marquee_bg_color: "#10b981",
      marquee_text_color: "#ffffff",
    },
  },
  {
    name: "Rose Pink",
    colors: {
      primary_color: "#f43f5e",
      secondary_color: "#1f1015",
      accent_color: "#4c1d24",
      text_color: "#ffffff",
      nav_bg_color: "#1a0a0f",
      footer_bg_color: "#1f1015",
      card_bg_color: "#4c1d24",
      button_color: "#f43f5e",
      button_hover_color: "#e11d48",
      marquee_bg_color: "#f43f5e",
      marquee_text_color: "#ffffff",
    },
  },
  {
    name: "Sunset Orange",
    colors: {
      primary_color: "#f97316",
      secondary_color: "#1c1008",
      accent_color: "#7c2d12",
      text_color: "#ffffff",
      nav_bg_color: "#1a0f08",
      footer_bg_color: "#1c1008",
      card_bg_color: "#7c2d12",
      button_color: "#f97316",
      button_hover_color: "#ea580c",
      marquee_bg_color: "#f97316",
      marquee_text_color: "#ffffff",
    },
  },
];

export default function AdminThemeSettings() {
  const { toast } = useToast();
  const [localColors, setLocalColors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<SiteSetting[]>({
    queryKey: ["/api/admin/settings"],
  });

  // Initialize settings mutation
  const initMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/settings/init");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Success", description: "Default settings initialized" });
    },
  });

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async (colors: Record<string, string>) => {
      const settingsArray = Object.entries(colors).map(([key, value]) => ({
        key,
        value,
      }));
      return apiRequest("PUT", "/api/admin/settings", { settings: settingsArray });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Theme colors saved successfully" });
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Reset settings mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/settings/reset");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Settings reset to default" });
      setHasChanges(false);
    },
  });

  // Initialize local colors from settings
  useEffect(() => {
    if (settings) {
      const colorSettings = settings.filter((s) => s.category === "colors");
      const colors: Record<string, string> = {};
      colorSettings.forEach((s) => {
        colors[s.settingKey] = s.settingValue;
      });
      setLocalColors(colors);
    }
  }, [settings]);

  // Initialize default settings if none exist
  useEffect(() => {
    if (settings && settings.length === 0) {
      initMutation.mutate();
    }
  }, [settings]);

  const handleColorChange = (key: string, value: string) => {
    setLocalColors((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(localColors);
  };

  const applyPreset = (preset: ColorPreset) => {
    setLocalColors(preset.colors);
    setHasChanges(true);
    toast({ title: "Preset Applied", description: `${preset.name} theme applied. Click Save to confirm.` });
  };

  const colorFields = [
    { key: "primary_color", label: "Primary Color", description: "Main accent color" },
    { key: "secondary_color", label: "Secondary Color", description: "Background color" },
    { key: "accent_color", label: "Accent Color", description: "Accent highlights" },
    { key: "text_color", label: "Text Color", description: "Main text color" },
    { key: "nav_bg_color", label: "Navigation Background", description: "Top nav bar" },
    { key: "footer_bg_color", label: "Footer Background", description: "Footer section" },
    { key: "card_bg_color", label: "Card Background", description: "Cards and panels" },
    { key: "button_color", label: "Button Color", description: "Primary buttons" },
    { key: "button_hover_color", label: "Button Hover", description: "Button hover state" },
    { key: "marquee_bg_color", label: "Marquee Background", description: "Scrolling banner" },
    { key: "marquee_text_color", label: "Marquee Text", description: "Banner text" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Palette className="h-8 w-8 text-amber-500" />
                Theme Settings
              </h1>
              <p className="text-gray-400">Customize your site colors and appearance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-gray-600 hover:bg-gray-700">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Default
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-800 border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Theme Settings?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    This will reset all colors to the default Amber Gold theme.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => resetMutation.mutate()}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saveMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="colors">Color Settings</TabsTrigger>
            <TabsTrigger value="presets">Theme Presets</TabsTrigger>
            <TabsTrigger value="preview">Live Preview</TabsTrigger>
          </TabsList>

          {/* Color Settings Tab */}
          <TabsContent value="colors">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {colorFields.map((field) => (
                  <Card key={field.key} className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{field.label}</CardTitle>
                      <CardDescription className="text-xs">{field.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-gray-600 cursor-pointer relative overflow-hidden"
                          style={{ backgroundColor: localColors[field.key] || "#000000" }}
                        >
                          <input
                            type="color"
                            value={localColors[field.key] || "#000000"}
                            onChange={(e) => handleColorChange(field.key, e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <Input
                          value={localColors[field.key] || ""}
                          onChange={(e) => handleColorChange(field.key, e.target.value)}
                          placeholder="#000000"
                          className="bg-gray-700 border-gray-600 font-mono text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Theme Presets Tab */}
          <TabsContent value="presets">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colorPresets.map((preset) => (
                <Card
                  key={preset.name}
                  className="bg-gray-800 border-gray-700 cursor-pointer hover:border-amber-500/50 transition-all duration-300"
                  onClick={() => applyPreset(preset)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{preset.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Color Preview */}
                    <div className="space-y-2">
                      <div
                        className="h-20 rounded-lg flex items-end p-3"
                        style={{
                          background: `linear-gradient(135deg, ${preset.colors.secondary_color} 0%, ${preset.colors.accent_color} 100%)`,
                        }}
                      >
                        <div
                          className="px-3 py-1 rounded text-sm font-bold"
                          style={{
                            backgroundColor: preset.colors.button_color,
                            color: preset.colors.marquee_text_color,
                          }}
                        >
                          Button
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {Object.entries(preset.colors)
                          .slice(0, 6)
                          .map(([key, color]) => (
                            <div
                              key={key}
                              className="flex-1 h-6 rounded"
                              style={{ backgroundColor: color }}
                              title={key}
                            />
                          ))}
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-gray-700 hover:bg-gray-600">
                      <Check className="h-4 w-4 mr-2" />
                      Apply Preset
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Preview Tab */}
          <TabsContent value="preview">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
                <CardDescription>See how your theme will look</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${localColors.secondary_color || "#1a1a2e"} 0%, ${localColors.accent_color || "#16213e"} 100%)`,
                  }}
                >
                  {/* Fake Navbar */}
                  <div
                    className="p-4 flex justify-between items-center"
                    style={{ backgroundColor: localColors.nav_bg_color || "#000000" }}
                  >
                    <span
                      className="font-bold text-lg"
                      style={{ color: localColors.primary_color || "#f59e0b" }}
                    >
                      ⭐ Rating - Ads
                    </span>
                    <div className="flex gap-4">
                      {["HOME", "FEATURES", "ADS", "CONTACT"].map((item) => (
                        <span
                          key={item}
                          className="text-sm font-bold"
                          style={{ color: localColors.primary_color || "#f59e0b" }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Fake Marquee */}
                  <div
                    className="py-2 text-center font-bold text-sm"
                    style={{
                      backgroundColor: localColors.marquee_bg_color || "#f59e0b",
                      color: localColors.marquee_text_color || "#000000",
                    }}
                  >
                    🔥 EARN MORE TODAY &gt;&gt;&gt; CLICK ADS & WIN &gt;&gt;&gt;
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: localColors.card_bg_color || "#1f2937" }}
                    >
                      <h3
                        className="font-bold text-lg mb-2"
                        style={{ color: localColors.text_color || "#ffffff" }}
                      >
                        Welcome, User
                      </h3>
                      <p
                        className="text-sm opacity-80"
                        style={{ color: localColors.text_color || "#ffffff" }}
                      >
                        @username
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <button
                        className="px-6 py-2 rounded font-bold transition-all"
                        style={{
                          backgroundColor: localColors.button_color || "#f59e0b",
                          color: localColors.marquee_text_color || "#000000",
                        }}
                      >
                        Primary Button
                      </button>
                      <button
                        className="px-6 py-2 rounded font-bold border-2"
                        style={{
                          borderColor: localColors.primary_color || "#f59e0b",
                          color: localColors.primary_color || "#f59e0b",
                          backgroundColor: "transparent",
                        }}
                      >
                        Secondary Button
                      </button>
                    </div>
                  </div>

                  {/* Fake Footer */}
                  <div
                    className="p-4 text-center text-sm"
                    style={{
                      backgroundColor: localColors.footer_bg_color || "#111827",
                      color: localColors.text_color || "#ffffff",
                    }}
                  >
                    © 2024 Rating-Ads. All rights reserved.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
