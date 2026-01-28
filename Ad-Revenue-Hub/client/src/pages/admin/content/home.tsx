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
import { Home, Save, ArrowLeft } from "lucide-react";

export default function AdminHomeContent() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"]
  });

  const [homeContent, setHomeContent] = useState({
    heroTitle: "Earn Money Just by Watching Ads",
    heroSubtitle: "Join thousands of users earning daily rewards",
    heroButtonText: "Get Started",
    feature1Title: "Daily Rewards",
    feature1Description: "Earn money every day by completing simple ad tasks",
    feature2Title: "Secure Payouts",
    feature2Description: "Withdraw your earnings safely to your bank account",
    feature3Title: "High Rates",
    feature3Description: "Get the best rates in the industry for watching ads"
  });

  useEffect(() => {
    if (settings) {
      setHomeContent({
        heroTitle: settings.heroTitle || homeContent.heroTitle,
        heroSubtitle: settings.heroSubtitle || homeContent.heroSubtitle,
        heroButtonText: settings.heroButtonText || homeContent.heroButtonText,
        feature1Title: settings.feature1Title || homeContent.feature1Title,
        feature1Description: settings.feature1Description || homeContent.feature1Description,
        feature2Title: settings.feature2Title || homeContent.feature2Title,
        feature2Description: settings.feature2Description || homeContent.feature2Description,
        feature3Title: settings.feature3Title || homeContent.feature3Title,
        feature3Description: settings.feature3Description || homeContent.feature3Description
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/settings/bulk", { settings: homeContent });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Home page content saved" });
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
        <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <Home className="h-6 w-6 text-cyan-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Home Page Content</h1>
          <p className="text-muted-foreground">Customize landing page text and features</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Hero Title</Label>
              <Input
                value={homeContent.heroTitle}
                onChange={(e) => setHomeContent({...homeContent, heroTitle: e.target.value})}
                placeholder="Main headline"
                data-testid="input-hero-title"
              />
            </div>
            <div>
              <Label>Hero Subtitle</Label>
              <Textarea
                value={homeContent.heroSubtitle}
                onChange={(e) => setHomeContent({...homeContent, heroSubtitle: e.target.value})}
                placeholder="Supporting text"
                data-testid="input-hero-subtitle"
              />
            </div>
            <div>
              <Label>Button Text</Label>
              <Input
                value={homeContent.heroButtonText}
                onChange={(e) => setHomeContent({...homeContent, heroButtonText: e.target.value})}
                placeholder="Get Started"
                data-testid="input-hero-button"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Feature Cards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label>Feature 1 Title</Label>
                <Input
                  value={homeContent.feature1Title}
                  onChange={(e) => setHomeContent({...homeContent, feature1Title: e.target.value})}
                  data-testid="input-feature1-title"
                />
              </div>
              <div>
                <Label>Feature 1 Description</Label>
                <Input
                  value={homeContent.feature1Description}
                  onChange={(e) => setHomeContent({...homeContent, feature1Description: e.target.value})}
                  data-testid="input-feature1-desc"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label>Feature 2 Title</Label>
                <Input
                  value={homeContent.feature2Title}
                  onChange={(e) => setHomeContent({...homeContent, feature2Title: e.target.value})}
                  data-testid="input-feature2-title"
                />
              </div>
              <div>
                <Label>Feature 2 Description</Label>
                <Input
                  value={homeContent.feature2Description}
                  onChange={(e) => setHomeContent({...homeContent, feature2Description: e.target.value})}
                  data-testid="input-feature2-desc"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label>Feature 3 Title</Label>
                <Input
                  value={homeContent.feature3Title}
                  onChange={(e) => setHomeContent({...homeContent, feature3Title: e.target.value})}
                  data-testid="input-feature3-title"
                />
              </div>
              <div>
                <Label>Feature 3 Description</Label>
                <Input
                  value={homeContent.feature3Description}
                  onChange={(e) => setHomeContent({...homeContent, feature3Description: e.target.value})}
                  data-testid="input-feature3-desc"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          data-testid="button-save-home-content"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Home Page Content
        </Button>
      </div>
    </AdminLayout>
  );
}
