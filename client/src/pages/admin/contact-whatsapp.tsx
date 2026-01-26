import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminContactWhatsapp() {
  const [numbers, setNumbers] = useState([
    { id: 1, number: "+94 77 123 4567", label: "Customer Support" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
          <MessageCircle className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">WhatsApp</h1>
          <p className="text-gray-400">Manage WhatsApp contact numbers</p>
        </div>
      </div>

      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">WhatsApp Numbers</CardTitle>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-1" /> Add Number
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {numbers.map(num => (
            <div key={num.id} className="p-4 rounded-lg bg-[#16213e] border border-gray-700 flex justify-between items-center">
              <div>
                <p className="text-white font-medium">{num.number}</p>
                <p className="text-gray-400 text-sm">{num.label}</p>
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
