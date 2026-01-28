import { AdminLayout } from "@/components/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, Send, MessageSquare, Save, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface ContactData {
  [key: string]: { value: string; isActive: boolean };
}

export default function AdminContact() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  
  const contactType = location.split("/").pop() || "phone";
  
  const { data: contactData } = useQuery<ContactData>({
    queryKey: ["/api/contact"]
  });

  const [value, setValue] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (contactData && contactData[contactType]) {
      setValue(contactData[contactType].value || "");
      setIsActive(contactData[contactType].isActive);
    } else {
      setValue("");
      setIsActive(true);
    }
  }, [contactData, contactType]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/contact", { type: contactType, value, isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
      toast({ title: "Contact info saved" });
    }
  });

  if (!(user as any)?.isAdmin) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  const icons: Record<string, any> = {
    phone: Phone,
    email: Mail,
    whatsapp: Send,
    telegram: Send
  };

  const labels: Record<string, string> = {
    phone: "Phone Number",
    email: "Email Address",
    whatsapp: "WhatsApp Number",
    telegram: "Telegram Username"
  };

  const placeholders: Record<string, string> = {
    phone: "+94 77 123 4567",
    email: "support@example.com",
    whatsapp: "+94771234567",
    telegram: "@username"
  };

  const Icon = icons[contactType] || MessageSquare;

  return (
    <AdminLayout>
      <Button 
        variant="ghost" 
        onClick={() => window.history.back()}
        className="text-zinc-400 hover:text-white mb-4"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Icon className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{labels[contactType]}</h1>
          <p className="text-muted-foreground">Manage your {contactType} contact information</p>
        </div>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg">Edit {labels[contactType]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{labels[contactType]}</Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholders[contactType]}
              data-testid={`input-contact-${contactType}`}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show on website</Label>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              data-testid={`switch-contact-${contactType}-active`}
            />
          </div>
          <Button
            className="w-full"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            data-testid={`button-save-contact-${contactType}`}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
