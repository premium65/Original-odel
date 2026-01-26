import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlidersHorizontal, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function AdminContentDashboard() {
  const [settings, setSettings] = useState({ showWelcome: true, welcomeText: "Welcome back!", showStats: true, showRecentAds: true, adsPerRow: "4" });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#8b5cf6]"><SlidersHorizontal className="h-6 w-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Dashboard Page</h1><p className="text-[#9ca3af]">Customize user dashboard</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a2332] border-[#2a3a4d]">
          <CardHeader><CardTitle className="text-white">Display Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label className="text-[#9ca3af]">Show Welcome Message</Label><Switch checked={settings.showWelcome} onCheckedChange={(v) => setSettings({...settings, showWelcome: v})} /></div>
            {settings.showWelcome && <div className="space-y-2"><Label className="text-[#9ca3af]">Welcome Text</Label><Input value={settings.welcomeText} onChange={(e) => setSettings({...settings, welcomeText: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" /></div>}
            <div className="flex items-center justify-between"><Label className="text-[#9ca3af]">Show Stats Cards</Label><Switch checked={settings.showStats} onCheckedChange={(v) => setSettings({...settings, showStats: v})} /></div>
            <div className="flex items-center justify-between"><Label className="text-[#9ca3af]">Show Recent Ads</Label><Switch checked={settings.showRecentAds} onCheckedChange={(v) => setSettings({...settings, showRecentAds: v})} /></div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3a4d]">
          <CardHeader><CardTitle className="text-white">Ads Grid Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label className="text-[#9ca3af]">Ads Per Row</Label><Input type="number" value={settings.adsPerRow} onChange={(e) => setSettings({...settings, adsPerRow: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" /></div>
          </CardContent>
        </Card>
      </div>
      <Button className="bg-[#8b5cf6] hover:bg-[#8b5cf6]/80"><Save className="h-4 w-4 mr-2" />Save Changes</Button>
    </div>
  );
}
