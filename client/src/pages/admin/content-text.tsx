import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Type, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function AdminContentText() {
  const [labels, setLabels] = useState([
    { key: "ad_reward", value: "101.75", description: "Reward per ad click (LKR)" },
    { key: "min_withdraw", value: "500", description: "Minimum withdrawal amount" },
    { key: "max_ads", value: "28", description: "Maximum ads per day" },
    { key: "cooldown_hours", value: "24", description: "Ad cooldown period (hours)" },
    { key: "currency", value: "LKR", description: "Currency symbol" },
    { key: "site_name", value: "OdelADS", description: "Site name" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
          <Type className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Text & Labels</h1>
          <p className="text-gray-400">Manage site-wide text and configuration values</p>
        </div>
      </div>

      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Configuration Values</CardTitle>
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-1" /> Add Label
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {labels.map((label, index) => (
              <div key={label.key} className="p-4 rounded-lg bg-[#16213e] border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-gray-500 text-xs">KEY</Label>
                    <p className="text-amber-400 font-mono text-sm">{label.key}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-500 text-xs">VALUE</Label>
                    <Input 
                      value={label.value}
                      onChange={(e) => {
                        const newLabels = [...labels];
                        newLabels[index].value = e.target.value;
                        setLabels(newLabels);
                      }}
                      className="bg-[#0d0d1a] border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-500 text-xs">DESCRIPTION</Label>
                    <p className="text-gray-400 text-sm">{label.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
        <Save className="h-4 w-4 mr-2" /> Save All Changes
      </Button>
    </div>
  );
}
