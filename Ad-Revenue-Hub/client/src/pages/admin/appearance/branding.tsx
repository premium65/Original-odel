import { AdminLayout } from "@/components/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, Image, ArrowLeft } from "lucide-react";

export default function AdminBranding() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"]
  });

  const [branding, setBranding] = useState({
    siteName: "AdClicker",
    siteTagline: "Earn money watching ads",
    logoUrl: "",
    faviconUrl: "",
    footerText: "AdClicker - Your trusted ad platform"
  });

  useEffect(() => {
    if (settings) {
      setBranding({
        siteName: settings.siteName || "AdClicker",
        siteTagline: settings.siteTagline || "Earn money watching ads",
        logoUrl: settings.logoUrl || "",
        faviconUrl: settings.faviconUrl || "",
        footerText: settings.footerText || "AdClicker - Your trusted ad platform"
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/settings/bulk", { settings: branding });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Branding settings saved" });
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
        <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
          <Settings className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Logo & Branding</h1>
          <p className="text-muted-foreground">Customize your site's identity</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Site Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Site Name</Label>
              <Input
                value={branding.siteName}
                onChange={(e) => setBranding({...branding, siteName: e.target.value})}
                placeholder="AdClicker"
                data-testid="input-site-name"
              />
            </div>
            <div>
              <Label>Tagline</Label>
              <Input
                value={branding.siteTagline}
                onChange={(e) => setBranding({...branding, siteTagline: e.target.value})}
                placeholder="Earn money watching ads"
                data-testid="input-site-tagline"
              />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input
                value={branding.logoUrl}
                onChange={(e) => setBranding({...branding, logoUrl: e.target.value})}
                placeholder="https://example.com/logo.png"
                data-testid="input-logo-url"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended size: 200x50 pixels
              </p>
            </div>
            <div>
              <Label>Favicon URL</Label>
              <Input
                value={branding.faviconUrl}
                onChange={(e) => setBranding({...branding, faviconUrl: e.target.value})}
                placeholder="https://example.com/favicon.ico"
                data-testid="input-favicon-url"
              />
            </div>
            <div>
              <Label>Footer Text</Label>
              <Textarea
                value={branding.footerText}
                onChange={(e) => setBranding({...branding, footerText: e.target.value})}
                placeholder="Copyright text and info..."
                data-testid="input-footer-text"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              data-testid="button-save-branding"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Branding
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-card rounded-lg border">
              <div className="flex items-center gap-3 mb-6">
                {branding.logoUrl ? (
                  <img
                    src={branding.logoUrl}
                    alt="Logo"
                    className="h-10 object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Image className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">{branding.siteName}</h3>
                  <p className="text-xs text-muted-foreground">{branding.siteTagline}</p>
                </div>
              </div>
              <div className="pt-4 border-t text-center">
                <p className="text-xs text-muted-foreground">{branding.footerText}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
