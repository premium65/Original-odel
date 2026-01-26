import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Palette, Image, Save, Loader2, RefreshCw } from "lucide-react";

export default function AdminAppearance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Theme State
  const [primaryColor, setPrimaryColor] = useState("#f59e0b");
  const [secondaryColor, setSecondaryColor] = useState("#10b981");
  const [backgroundColor, setBackgroundColor] = useState("#0f1419");
  const [cardColor, setCardColor] = useState("#1a2332");
  const [accentColor, setAccentColor] = useState("#B8936B");

  // Branding State
  const [siteName, setSiteName] = useState("");
  const [siteTagline, setSiteTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  // Fetch theme
  const { isLoading: loadingTheme } = useQuery({
    queryKey: ["/api/admin/settings/theme"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings/theme", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPrimaryColor(data.primary_color || "#f59e0b");
      setSecondaryColor(data.secondary_color || "#10b981");
      setBackgroundColor(data.background_color || "#0f1419");
      setCardColor(data.card_color || "#1a2332");
      setAccentColor(data.accent_color || "#B8936B");
      return data;
    },
  });

  // Fetch branding
  const { isLoading: loadingBranding } = useQuery({
    queryKey: ["/api/admin/settings/branding"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings/branding", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSiteName(data.site_name || "");
      setSiteTagline(data.site_tagline || "");
      setLogoUrl(data.logo_url || "");
      setFaviconUrl(data.favicon_url || "");
      return data;
    },
  });

  // Save theme
  const saveTheme = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/settings/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          background_color: backgroundColor,
          card_color: cardColor,
          accent_color: accentColor,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Saved!", description: "Theme colors updated. Refresh page to see changes." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/theme"] });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to save." }),
  });

  // Save branding
  const saveBranding = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/settings/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          site_name: siteName,
          site_tagline: siteTagline,
          logo_url: logoUrl,
          favicon_url: faviconUrl,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Saved!", description: "Branding updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/branding"] });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to save." }),
  });

  // Preset themes
  const presetThemes = [
    { name: "OdelADS Gold", primary: "#f59e0b", secondary: "#10b981", bg: "#0f1419", card: "#1a2332", accent: "#B8936B" },
    { name: "Ocean Blue", primary: "#3b82f6", secondary: "#06b6d4", bg: "#0f172a", card: "#1e293b", accent: "#60a5fa" },
    { name: "Royal Purple", primary: "#8b5cf6", secondary: "#ec4899", bg: "#1a1025", card: "#2d1f3d", accent: "#a78bfa" },
    { name: "Forest Green", primary: "#22c55e", secondary: "#84cc16", bg: "#0f1f0f", card: "#1a2e1a", accent: "#4ade80" },
    { name: "Sunset Red", primary: "#ef4444", secondary: "#f97316", bg: "#1f0f0f", card: "#2e1a1a", accent: "#f87171" },
  ];

  const applyPreset = (preset: typeof presetThemes[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setBackgroundColor(preset.bg);
    setCardColor(preset.card);
    setAccentColor(preset.accent);
  };

  if (loadingTheme || loadingBranding) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#B8936B]">⚙️ Appearance</h1>
        <p className="text-gray-400">Customize theme colors and branding</p>
      </div>

      <Tabs defaultValue="theme" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-[#1a2332]">
          <TabsTrigger value="theme" className="data-[state=active]:bg-amber-600">🎨 Theme Colors</TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-amber-600">🏷️ Logo & Branding</TabsTrigger>
        </TabsList>

        {/* Theme Tab */}
        <TabsContent value="theme" className="space-y-4">
          {/* Preset Themes */}
          <Card className="bg-[#1a2332] border-[#2a3a4d]">
            <CardHeader>
              <CardTitle className="text-white">Quick Presets</CardTitle>
              <CardDescription>Choose a preset theme or customize below</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {presetThemes.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    onClick={() => applyPreset(preset)}
                    className="border-[#2a3a4d] hover:bg-[#2a3a4d]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                      <span className="text-white">{preset.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Colors */}
          <Card className="bg-[#1a2332] border-[#2a3a4d]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Palette className="h-5 w-5 text-amber-500" />
                Custom Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1 bg-transparent border-[#2a3a4d]"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="bg-[#0f1419] border-[#2a3a4d] text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 h-10 p-1 bg-transparent border-[#2a3a4d]"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="bg-[#0f1419] border-[#2a3a4d] text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-16 h-10 p-1 bg-transparent border-[#2a3a4d]"
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="bg-[#0f1419] border-[#2a3a4d] text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-16 h-10 p-1 bg-transparent border-[#2a3a4d]"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="bg-[#0f1419] border-[#2a3a4d] text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Card Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={cardColor}
                      onChange={(e) => setCardColor(e.target.value)}
                      className="w-16 h-10 p-1 bg-transparent border-[#2a3a4d]"
                    />
                    <Input
                      value={cardColor}
                      onChange={(e) => setCardColor(e.target.value)}
                      className="bg-[#0f1419] border-[#2a3a4d] text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: backgroundColor }}>
                <p className="text-sm text-gray-400 mb-2">Preview:</p>
                <div className="p-4 rounded-lg" style={{ backgroundColor: cardColor }}>
                  <h3 style={{ color: primaryColor }} className="font-bold">Primary Text</h3>
                  <p style={{ color: secondaryColor }}>Secondary text color</p>
                  <p style={{ color: accentColor }}>Accent text color</p>
                  <Button className="mt-2" style={{ backgroundColor: primaryColor }}>Primary Button</Button>
                </div>
              </div>

              <Button onClick={() => saveTheme.mutate()} disabled={saveTheme.isPending} className="w-full bg-amber-600 hover:bg-amber-700">
                {saveTheme.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Theme Colors
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <Card className="bg-[#1a2332] border-[#2a3a4d]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Image className="h-5 w-5 text-amber-500" />
                Logo & Branding
              </CardTitle>
              <CardDescription>Set your site name and logo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Site Name</Label>
                  <Input
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="OdelADS"
                    className="bg-[#0f1419] border-[#2a3a4d] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Site Tagline</Label>
                  <Input
                    value={siteTagline}
                    onChange={(e) => setSiteTagline(e.target.value)}
                    placeholder="Premium Ad Platform"
                    className="bg-[#0f1419] border-[#2a3a4d] text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Logo URL</Label>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="bg-[#0f1419] border-[#2a3a4d] text-white"
                />
                {logoUrl && (
                  <div className="mt-2 p-4 bg-[#0f1419] rounded-lg">
                    <p className="text-xs text-gray-400 mb-2">Preview:</p>
                    <img src={logoUrl} alt="Logo preview" className="max-h-16 object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Favicon URL</Label>
                <Input
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                  className="bg-[#0f1419] border-[#2a3a4d] text-white"
                />
              </div>

              <Button onClick={() => saveBranding.mutate()} disabled={saveBranding.isPending} className="w-full bg-amber-600 hover:bg-amber-700">
                {saveBranding.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Branding
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
