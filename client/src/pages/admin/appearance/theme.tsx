import { AdminLayout } from "@/components/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Palette, Save, ArrowLeft } from "lucide-react";

export default function AdminTheme() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"]
  });

  const [colors, setColors] = useState({
    primaryColor: "#22c55e",
    secondaryColor: "#3b82f6",
    accentColor: "#eab308",
    backgroundColor: "#0a0a0a",
    cardColor: "#171717"
  });

  useEffect(() => {
    if (settings) {
      setColors({
        primaryColor: settings.primaryColor || "#22c55e",
        secondaryColor: settings.secondaryColor || "#3b82f6",
        accentColor: settings.accentColor || "#eab308",
        backgroundColor: settings.backgroundColor || "#0a0a0a",
        cardColor: settings.cardColor || "#171717"
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/settings/bulk", { settings: colors });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Theme colors saved" });
    }
  });

  if (!(user as any)?.isAdmin) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  return (
    <AdminLayout>
      <Button 
        variant="ghost" 
        onClick={() => window.history.back()}
        className="text-zinc-400 hover:text-white mb-4"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
          <Palette className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Theme Colors</h1>
          <p className="text-muted-foreground">Customize your site's color scheme</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Color Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colors.primaryColor}
                  onChange={(e) => setColors({...colors, primaryColor: e.target.value})}
                  className="w-16 h-10 p-1 cursor-pointer"
                  data-testid="input-color-primary"
                />
                <Input
                  value={colors.primaryColor}
                  onChange={(e) => setColors({...colors, primaryColor: e.target.value})}
                  placeholder="#22c55e"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colors.secondaryColor}
                  onChange={(e) => setColors({...colors, secondaryColor: e.target.value})}
                  className="w-16 h-10 p-1 cursor-pointer"
                  data-testid="input-color-secondary"
                />
                <Input
                  value={colors.secondaryColor}
                  onChange={(e) => setColors({...colors, secondaryColor: e.target.value})}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colors.accentColor}
                  onChange={(e) => setColors({...colors, accentColor: e.target.value})}
                  className="w-16 h-10 p-1 cursor-pointer"
                  data-testid="input-color-accent"
                />
                <Input
                  value={colors.accentColor}
                  onChange={(e) => setColors({...colors, accentColor: e.target.value})}
                  placeholder="#eab308"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colors.backgroundColor}
                  onChange={(e) => setColors({...colors, backgroundColor: e.target.value})}
                  className="w-16 h-10 p-1 cursor-pointer"
                  data-testid="input-color-background"
                />
                <Input
                  value={colors.backgroundColor}
                  onChange={(e) => setColors({...colors, backgroundColor: e.target.value})}
                  placeholder="#0a0a0a"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>Card Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colors.cardColor}
                  onChange={(e) => setColors({...colors, cardColor: e.target.value})}
                  className="w-16 h-10 p-1 cursor-pointer"
                  data-testid="input-color-card"
                />
                <Input
                  value={colors.cardColor}
                  onChange={(e) => setColors({...colors, cardColor: e.target.value})}
                  placeholder="#171717"
                  className="flex-1"
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              data-testid="button-save-theme"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Theme
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="p-6 rounded-lg"
              style={{ backgroundColor: colors.backgroundColor }}
            >
              <div
                className="p-4 rounded-lg mb-4"
                style={{ backgroundColor: colors.cardColor }}
              >
                <h3 className="font-bold text-white mb-2">Card Preview</h3>
                <p className="text-gray-400 text-sm">This is how cards will look</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded text-white font-medium"
                  style={{ backgroundColor: colors.primaryColor }}
                >
                  Primary
                </button>
                <button
                  className="px-4 py-2 rounded text-white font-medium"
                  style={{ backgroundColor: colors.secondaryColor }}
                >
                  Secondary
                </button>
                <button
                  className="px-4 py-2 rounded text-black font-medium"
                  style={{ backgroundColor: colors.accentColor }}
                >
                  Accent
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
