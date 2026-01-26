import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminContactTelegram() {
  const [channels, setChannels] = useState([
    { id: 1, username: "@OdelAdsSupport", label: "Support Channel" },
    { id: 2, username: "@OdelAdsOfficial", label: "Official Channel" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
          <Send className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Telegram</h1>
          <p className="text-gray-400">Manage Telegram channels and contacts</p>
        </div>
      </div>

      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Telegram Channels</CardTitle>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-1" /> Add Channel
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {channels.map(ch => (
            <div key={ch.id} className="p-4 rounded-lg bg-[#16213e] border border-gray-700 flex justify-between items-center">
              <div>
                <p className="text-white font-medium">{ch.username}</p>
                <p className="text-gray-400 text-sm">{ch.label}</p>
              </div>
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
