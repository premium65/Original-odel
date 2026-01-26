import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Save, Image, Type, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function AdminContentHome() {
  const [content, setContent] = useState({
    heroTitle: "Welcome to OdelADS",
    heroSubtitle: "Earn money by clicking ads",
    heroButtonText: "Get Started",
    featureTitle: "Why Choose Us?",
    feature1: "High Payouts",
    feature2: "Fast Withdrawals",
    feature3: "24/7 Support"
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
          <Home className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Home Page</h1>
          <p className="text-gray-400">Customize home page content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a2e] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Type className="h-5 w-5" /> Hero Section
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Hero Title</Label>
              <Input 
                value={content.heroTitle}
                onChange={(e) => setContent({...content, heroTitle: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Hero Subtitle</Label>
              <Textarea 
                value={content.heroSubtitle}
                onChange={(e) => setContent({...content, heroSubtitle: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Button Text</Label>
              <Input 
                value={content.heroButtonText}
                onChange={(e) => setContent({...content, heroButtonText: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Link className="h-5 w-5" /> Features Section
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Section Title</Label>
              <Input 
                value={content.featureTitle}
                onChange={(e) => setContent({...content, featureTitle: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Feature 1</Label>
              <Input 
                value={content.feature1}
                onChange={(e) => setContent({...content, feature1: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Feature 2</Label>
              <Input 
                value={content.feature2}
                onChange={(e) => setContent({...content, feature2: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Feature 3</Label>
              <Input 
                value={content.feature3}
                onChange={(e) => setContent({...content, feature3: e.target.value})}
                className="bg-[#16213e] border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
        <Save className="h-4 w-4 mr-2" /> Save All Changes
      </Button>
    </div>
  );
}
