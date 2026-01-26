import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, Save, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function AdminBranding() {
  const [branding, setBranding] = useState({ siteName: "OdelADS", tagline: "Earn While You Browse", footerText: "© 2024 OdelADS. All rights reserved." });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#ec4899]"><ImageIcon className="h-6 w-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Logo & Branding</h1><p className="text-[#9ca3af]">Manage site branding</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a2332] border-[#2a3a4d]">
          <CardHeader><CardTitle className="text-white">Site Identity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label className="text-[#9ca3af]">Site Name</Label><Input value={branding.siteName} onChange={(e) => setBranding({...branding, siteName: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" /></div>
            <div className="space-y-2"><Label className="text-[#9ca3af]">Tagline</Label><Input value={branding.tagline} onChange={(e) => setBranding({...branding, tagline: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" /></div>
            <div className="space-y-2"><Label className="text-[#9ca3af]">Footer Text</Label><Input value={branding.footerText} onChange={(e) => setBranding({...branding, footerText: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" /></div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3a4d]">
          <CardHeader><CardTitle className="text-white">Logo & Favicon</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#9ca3af]">Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-[#0f1419] border border-[#2a3a4d] flex items-center justify-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#10b981] to-[#06b6d4] flex items-center justify-center"><span className="text-white font-bold text-xl">O</span></div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" className="border-[#2a3a4d] text-[#9ca3af]"><Upload className="h-4 w-4 mr-1" />Upload</Button>
                  <Button size="sm" variant="ghost" className="text-[#ef4444]"><Trash2 className="h-4 w-4 mr-1" />Remove</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Button className="bg-[#ec4899] hover:bg-[#ec4899]/80"><Save className="h-4 w-4 mr-2" />Save Changes</Button>
    </div>
  );
}
