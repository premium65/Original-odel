import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function AdminInfoAbout() {
  const [content, setContent] = useState({ title: "About OdelADS", description: "OdelADS is a leading digital advertising platform...", mission: "Our mission is to revolutionize digital advertising...", vision: "To be the most trusted advertising platform..." });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#8b5cf6]"><Info className="h-6 w-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">About Us</h1><p className="text-[#9ca3af]">Edit about us page</p></div>
      </div>
      <Card className="bg-[#1a2332] border-[#2a3a4d]">
        <CardHeader><CardTitle className="text-white">Page Content</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label className="text-[#9ca3af]">Title</Label><Input value={content.title} onChange={(e) => setContent({...content, title: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white" /></div>
          <div className="space-y-2"><Label className="text-[#9ca3af]">Description</Label><Textarea value={content.description} onChange={(e) => setContent({...content, description: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white min-h-[100px]" /></div>
          <div className="space-y-2"><Label className="text-[#9ca3af]">Mission</Label><Textarea value={content.mission} onChange={(e) => setContent({...content, mission: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white min-h-[100px]" /></div>
          <div className="space-y-2"><Label className="text-[#9ca3af]">Vision</Label><Textarea value={content.vision} onChange={(e) => setContent({...content, vision: e.target.value})} className="bg-[#0f1419] border-[#2a3a4d] text-white min-h-[100px]" /></div>
          <Button className="bg-[#8b5cf6] hover:bg-[#8b5cf6]/80"><Save className="h-4 w-4 mr-2" />Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
