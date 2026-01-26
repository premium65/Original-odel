import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminContactPhone() {
  const [phones] = useState([{ id: 1, number: "+94 77 123 4567", label: "Main Support" }, { id: 2, number: "+94 11 234 5678", label: "Office" }]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#10b981]"><Phone className="h-6 w-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Phone Numbers</h1><p className="text-[#9ca3af]">Manage contact phone numbers</p></div>
      </div>
      <Card className="bg-[#1a2332] border-[#2a3a4d]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Phone Numbers</CardTitle>
          <Button size="sm" className="bg-[#10b981] hover:bg-[#10b981]/80"><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {phones.map(phone => (
            <div key={phone.id} className="p-4 rounded-lg bg-[#0f1419] border border-[#2a3a4d] flex justify-between items-center">
              <div><p className="text-white font-medium">{phone.number}</p><p className="text-[#6b7280] text-sm">{phone.label}</p></div>
              <Button variant="ghost" size="sm" className="text-[#ef4444] hover:text-[#ef4444]/80"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
