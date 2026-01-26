import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function AdminInfoPrivacy() {
  const [privacy, setPrivacy] = useState(`Privacy Policy

1. Information We Collect
We collect personal information including name, email, phone number, and bank details for withdrawal processing.

2. How We Use Your Information
Your information is used to process payments, improve our services, and communicate with you.

3. Data Security
We implement industry-standard security measures to protect your data.

4. Third Party Sharing
We do not sell or share your personal information with third parties.

5. Your Rights
You have the right to access, correct, or delete your personal information.`);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
          <p className="text-gray-400">Edit privacy policy content</p>
        </div>
      </div>

      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Privacy Policy Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            className="bg-[#16213e] border-gray-600 text-white min-h-[400px] font-mono text-sm"
          />
          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
