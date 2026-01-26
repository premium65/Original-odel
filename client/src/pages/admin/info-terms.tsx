import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function AdminInfoTerms() {
  const [terms, setTerms] = useState(`Terms and Conditions

1. Introduction
Welcome to OdelADS. These terms and conditions govern your use of our platform.

2. User Accounts
Users must provide accurate information when creating accounts.

3. Ad Clicking Rules
Users must complete ads within the specified timeframe. Fraudulent clicking is prohibited.

4. Withdrawals
Minimum withdrawal amount is LKR 500. Processing takes 24-48 hours.

5. Termination
We reserve the right to terminate accounts that violate these terms.`);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
          <FileQuestion className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Terms & Conditions</h1>
          <p className="text-gray-400">Edit terms and conditions content</p>
        </div>
      </div>

      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Terms Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="bg-[#16213e] border-gray-600 text-white min-h-[400px] font-mono text-sm"
          />
          <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
