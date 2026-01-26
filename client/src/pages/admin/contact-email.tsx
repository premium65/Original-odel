import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminContactEmail() {
  const [emails, setEmails] = useState([
    { id: 1, email: "support@odelads.com", label: "Support" },
    { id: 2, email: "info@odelads.com", label: "General Inquiries" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
          <Mail className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Email Addresses</h1>
          <p className="text-gray-400">Manage contact email addresses</p>
        </div>
      </div>

      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Email Addresses</CardTitle>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-1" /> Add Email
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {emails.map(email => (
            <div key={email.id} className="p-4 rounded-lg bg-[#16213e] border border-gray-700 flex justify-between items-center">
              <div>
                <p className="text-white font-medium">{email.email}</p>
                <p className="text-gray-400 text-sm">{email.label}</p>
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
