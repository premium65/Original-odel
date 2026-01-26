import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function AdminInfoTerms() {
  const [terms, setTerms] = useState("Terms and Conditions\n\n1. Introduction\nWelcome to OdelADS...\n\n2. User Accounts\nUsers must provide accurate information...");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#f59e0b]"><FileQuestion className="h-6 w-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Terms & Conditions</h1><p className="text-[#9ca3af]">Edit terms content</p></div>
      </div>
      <Card className="bg-[#1a2332] border-[#2a3a4d]">
        <CardHeader><CardTitle className="text-white">Terms Content</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} className="bg-[#0f1419] border-[#2a3a4d] text-white min-h-[400px] font-mono text-sm" />
          <Button className="bg-[#f59e0b] hover:bg-[#f59e0b]/80"><Save className="h-4 w-4 mr-2" />Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
