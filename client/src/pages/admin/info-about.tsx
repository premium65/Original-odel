import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function AdminInfoAbout() {
  const [content, setContent] = useState({
    title: "About OdelADS",
    description: "OdelADS is a leading digital advertising platform that connects advertisers with engaged audiences...",
    mission: "Our mission is to revolutionize digital advertising by creating meaningful connections...",
    vision: "To be the most trusted advertising platform in Sri Lanka..."
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
          <Info className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">About Us</h1>
          <p className="text-gray-400">Edit about us page content</p>
        </div>
      </div>

      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Page Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Page Title</Label>
            <Input 
              value={content.title}
              onChange={(e) => setContent({...content, title: e.target.value})}
              className="bg-[#16213e] border-gray-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Description</Label>
            <Textarea 
              value={content.description}
              onChange={(e) => setContent({...content, description: e.target.value})}
              className="bg-[#16213e] border-gray-600 text-white min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Our Mission</Label>
            <Textarea 
              value={content.mission}
              onChange={(e) => setContent({...content, mission: e.target.value})}
              className="bg-[#16213e] border-gray-600 text-white min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Our Vision</Label>
            <Textarea 
              value={content.vision}
              onChange={(e) => setContent({...content, vision: e.target.value})}
              className="bg-[#16213e] border-gray-600 text-white min-h-[100px]"
            />
          </div>
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
