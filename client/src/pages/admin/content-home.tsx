import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Save, Type, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function AdminContentHome() {
  const [content, setContent] = useState({ heroTitle: "Welcome to OdelADS", heroSubtitle: "Earn money by clicking ads", heroButtonText: "Get Started", featureTitle: "Why Choose Us?", feature1: "High Payouts", feature2: "Fast Withdrawals", feature3: "24/7 Support" });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#3b82f6]"><Home className="h-6 w-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Home Page</h1><p className="text-[#9ca3af]">Customize home page</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a2332] border-[#2a3a4d]">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Type className="h-5 w-5" />Hero Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label className="text-[#9ca3af]">Hero Title</Label><Input value={content.heroTitle} onChange={(e) => setContent({...content, heroTitle: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" /></div>
            <div className="space-y-2"><Label className="text-[#9ca3af]">Subtitle</Label><Textarea value={content.heroSubtitle} onChange={(e) => setContent({...content, heroSubtitle: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" /></div>
            <div className="space-y-2"><Label className="text-[#9ca3af]">Button Text</Label><Input value={content.heroButtonText} onChange={(e) => setContent({...content, heroButtonText: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" /></div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3a4d]">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Link className="h-5 w-5" />Features</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label className="text-[#9ca3af]">Section Title</Label><Input value={content.featureTitle} onChange={(e) => setContent({...content, featureTitle: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" /></div>
            <div className="space-y-2"><Label className="text-[#9ca3af]">Feature 1</Label><Input value={content.feature1} onChange={(e) => setContent({...content, feature1: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" /></div>
            <div className="space-y-2"><Label className="text-[#9ca3af]">Feature 2</Label><Input value={content.feature2} onChange={(e) => setContent({...content, feature2: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" /></div>
            <div className="space-y-2"><Label className="text-[#9ca3af]">Feature 3</Label><Input value={content.feature3} onChange={(e) => setContent({...content, feature3: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" /></div>
          </CardContent>
        </Card>
      </div>
      <Button className="bg-[#3b82f6] hover:bg-[#3b82f6]/80"><Save className="h-4 w-4 mr-2" />Save All</Button>
    </div>
  );
}
