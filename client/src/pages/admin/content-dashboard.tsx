import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlidersHorizontal, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function AdminContentDashboard() {
  const [settings, setSettings] = useState({
    showWelcomeMessage: true,
    welcomeText: "Welcome back!",
    showStats: true,
    showRecentAds: true,
    showWithdrawButton: true,
    adsPerRow: "4",
    maxAdsDisplay: "28"
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
          <SlidersHorizontal className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Page</h1>
          <p className="text-gray-400">Customize user dashboard settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a2e] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Display Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Show Welcome Message</Label>
              <Switch 
                checked={settings.showWelcomeMessage}
                onCheckedChange={(v) => setSettings({...settings, showWelcomeMessage: v})}
              />
            </div>
            {settings.showWelcomeMessage && (
              <div className="space-y-2">
                <Label className="text-gray-300">Welcome Text</Label>
                <Input 
                  value={settings.welcomeText}
                  onChange={(e) => setSettings({...settings, welcomeText: e.target.value})}
                  className="bg-[#16213e] border-gray-600 text-white"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Show Stats Cards</Label>
              <Switch 
                checked={settings.showStats}
                onCheckedChange={(v) => setSettings({...settings, showStats: v})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Show Recent Ads</Label>
              <Switch 
                checked={settings.showRecentAds}
                onCheckedChange={(v) => setSettings({...settings, showRecentAds: v})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Show Withdraw Button</Label>
              <Switch 
                checked={settings.showWithdrawButton}
                onCheckedChange={(v) => setSettings({...settings, showWithdrawButton: v})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Ads Grid Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Ads Per Row</Label>
              <Input 
                type="number"
                value={settings.adsPerRow}
                onChange={(e) => setSettings({...settings, adsPerRow: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Maximum Ads to Display</Label>
              <Input 
                type="number"
                value={settings.maxAdsDisplay}
                onChange={(e) => setSettings({...settings, maxAdsDisplay: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
        <Button variant="outline" className="border-gray-600 text-gray-300">
          <Eye className="h-4 w-4 mr-2" /> Preview
        </Button>
      </div>
    </div>
  );
}
