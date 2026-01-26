import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function AdminInfoPrivacy() {
  const [privacy, setPrivacy] = useState("Privacy Policy\n\n1. Information We Collect\nWe collect personal information...\n\n2. How We Use Your Information\nYour information is used to process payments...");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#10b981]"><Shield className="h-6 w-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Privacy Policy</h1><p className="text-[#9ca3af]">Edit privacy policy</p></div>
      </div>
      <Card className="bg-[#1a2332] border-[#2a3a4d]">
        <CardHeader><CardTitle className="text-white">Privacy Policy Content</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={privacy} onChange={(e) => setPrivacy(e.target.value)} className="bg-[#0f1419] border-[#2a3a4d] text-white min-h-[400px] font-mono text-sm" />
          <Button className="bg-[#10b981] hover:bg-[#10b981]/80"><Save className="h-4 w-4 mr-2" />Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
