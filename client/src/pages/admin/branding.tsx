import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, Save, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function AdminBranding() {
  const [branding, setBranding] = useState({
    siteName: "OdelADS",
    tagline: "Earn While You Browse",
    logoUrl: "/logo.png",
    faviconUrl: "/favicon.ico",
    footerText: "© 2024 OdelADS. All rights reserved."
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-red-600">
          <ImageIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Logo & Branding</h1>
          <p className="text-gray-400">Manage site logo and branding</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a2e] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Site Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Site Name</Label>
              <Input 
                value={branding.siteName}
                onChange={(e) => setBranding({...branding, siteName: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Tagline</Label>
              <Input 
                value={branding.tagline}
                onChange={(e) => setBranding({...branding, tagline: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Footer Text</Label>
              <Input 
                value={branding.footerText}
                onChange={(e) => setBranding({...branding, footerText: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Logo & Favicon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-[#16213e] border border-gray-600 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">O</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                    <Upload className="h-4 w-4 mr-1" /> Upload
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-400">
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Favicon</Label>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#16213e] border border-gray-600 flex items-center justify-center">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">O</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                  <Upload className="h-4 w-4 mr-1" /> Upload
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700">
        <Save className="h-4 w-4 mr-2" /> Save Changes
      </Button>
    </div>
  );
}
