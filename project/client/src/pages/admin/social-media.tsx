import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MessageCircle, Send, Building, FileText, Shield, Save, Loader2 } from "lucide-react";

export default function AdminSocialMedia() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Contact State
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");

  // Legal State
  const [aboutUs, setAboutUs] = useState("");
  const [terms, setTerms] = useState("");
  const [privacy, setPrivacy] = useState("");

  // Fetch contact settings
  const { isLoading: loadingContact } = useQuery({
    queryKey: ["/api/admin/settings/contact"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings/contact", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPhone(data.phone || "");
      setEmail(data.email || "");
      setWhatsapp(data.whatsapp || "");
      setTelegram(data.telegram || "");
      setFacebook(data.facebook || "");
      setInstagram(data.instagram || "");
      return data;
    },
  });

  // Fetch legal settings
  const { isLoading: loadingLegal } = useQuery({
    queryKey: ["/api/admin/settings/legal"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings/legal", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAboutUs(data.about_us || "");
      setTerms(data.terms || "");
      setPrivacy(data.privacy || "");
      return data;
    },
  });

  // Save contact
  const saveContact = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/settings/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, email, whatsapp, telegram, facebook, instagram }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Saved!", description: "Contact information updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/contact"] });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to save." });
    },
  });

  // Save legal
  const saveLegal = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/settings/legal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ about_us: aboutUs, terms, privacy }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Saved!", description: "Legal content updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/legal"] });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to save." });
    },
  });

  if (loadingContact || loadingLegal) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#B8936B]">🌐 Social Media & Info</h1>
        <p className="text-gray-400">Manage contact information and legal pages</p>
      </div>

      <Tabs defaultValue="contact" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-[#1a2332]">
          <TabsTrigger value="contact" className="data-[state=active]:bg-amber-600">📞 Contact Info</TabsTrigger>
          <TabsTrigger value="legal" className="data-[state=active]:bg-amber-600">📋 Legal Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3a4d]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Phone className="h-5 w-5 text-amber-500" />
                Contact Information
              </CardTitle>
              <CardDescription>These details will be shown on the website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-300">
                    <Phone className="h-4 w-4" /> Phone Number
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="bg-[#0f1419] border-[#2a3a4d] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-300">
                    <Mail className="h-4 w-4" /> Email Address
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="support@odelads.online"
                    className="bg-[#0f1419] border-[#2a3a4d] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-300">
                    <MessageCircle className="h-4 w-4 text-green-500" /> WhatsApp
                  </Label>
                  <Input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="bg-[#0f1419] border-[#2a3a4d] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-300">
                    <Send className="h-4 w-4 text-blue-500" /> Telegram
                  </Label>
                  <Input
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@odelads"
                    className="bg-[#0f1419] border-[#2a3a4d] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Facebook URL</Label>
                  <Input
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/odelads"
                    className="bg-[#0f1419] border-[#2a3a4d] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Instagram URL</Label>
                  <Input
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/odelads"
                    className="bg-[#0f1419] border-[#2a3a4d] text-white"
                  />
                </div>
              </div>

              <Button
                onClick={() => saveContact.mutate()}
                disabled={saveContact.isPending}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {saveContact.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Contact Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3a4d]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Building className="h-5 w-5 text-amber-500" />
                About Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={aboutUs}
                onChange={(e) => setAboutUs(e.target.value)}
                placeholder="Write about your company..."
                rows={6}
                className="bg-[#0f1419] border-[#2a3a4d] text-white"
              />
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3a4d]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-amber-500" />
                Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Enter your terms and conditions..."
                rows={8}
                className="bg-[#0f1419] border-[#2a3a4d] text-white"
              />
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3a4d]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-amber-500" />
                Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                placeholder="Enter your privacy policy..."
                rows={8}
                className="bg-[#0f1419] border-[#2a3a4d] text-white"
              />
            </CardContent>
          </Card>

          <Button
            onClick={() => saveLegal.mutate()}
            disabled={saveLegal.isPending}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {saveLegal.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Legal Content
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
