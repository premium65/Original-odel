import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Type, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function AdminContentText() {
  const [labels, setLabels] = useState([
    { key: "ad_reward", value: "101.75", description: "Reward per ad (LKR)" },
    { key: "min_withdraw", value: "500", description: "Min withdrawal" },
    { key: "max_ads", value: "28", description: "Max ads per day" },
    { key: "site_name", value: "OdelADS", description: "Site name" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#06b6d4]"><Type className="h-6 w-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Text & Labels</h1><p className="text-[#9ca3af]">Manage site-wide text</p></div>
      </div>
      <Card className="bg-[#1a2332] border-[#2a3a4d]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Configuration Values</CardTitle>
          <Button size="sm" className="bg-[#06b6d4] hover:bg-[#06b6d4]/80"><Plus className="h-4 w-4 mr-1" />Add</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {labels.map((label, i) => (
              <div key={label.key} className="p-4 rounded-lg bg-[#0f1419] border border-[#2a3a4d]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><Label className="text-[#6b7280] text-xs">KEY</Label><p className="text-[#f59e0b] font-mono text-sm">{label.key}</p></div>
                  <div><Label className="text-[#6b7280] text-xs">VALUE</Label><Input value={label.value} onChange={(e) => { const n = [...labels]; n[i].value = e.target.value; setLabels(n); }} className="bg-[#1a2332] border-[#2a3a4d] text-white" /></div>
                  <div><Label className="text-[#6b7280] text-xs">DESC</Label><p className="text-[#9ca3af] text-sm">{label.description}</p></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Button className="bg-[#06b6d4] hover:bg-[#06b6d4]/80"><Save className="h-4 w-4 mr-2" />Save All</Button>
    </div>
  );
}
