import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminContactTelegram() {
  const [channels] = useState([{ id: 1, username: "@OdelAdsSupport", label: "Support" }, { id: 2, username: "@OdelAdsOfficial", label: "Official" }]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#06b6d4]"><Send className="h-6 w-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Telegram</h1><p className="text-[#9ca3af]">Manage Telegram channels</p></div>
      </div>
      <Card className="bg-[#1a2332] border-[#2a3a4d]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Telegram Channels</CardTitle>
          <Button size="sm" className="bg-[#06b6d4] hover:bg-[#06b6d4]/80"><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {channels.map(ch => (
            <div key={ch.id} className="p-4 rounded-lg bg-[#0f1419] border border-[#2a3a4d] flex justify-between items-center">
              <div><p className="text-white font-medium">{ch.username}</p><p className="text-[#6b7280] text-sm">{ch.label}</p></div>
              <Button variant="ghost" size="sm" className="text-[#ef4444] hover:text-[#ef4444]/80"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
