import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, ArrowLeft } from "lucide-react";

export default function DashboardSettingsPage() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const [formData, setFormData] = useState({
    promoVideoUrl: "",
    promoTitle: "",
    promoSubtitle: "",
    marqueeText: "",
    flashSaleTitle: "",
    flashSaleSubtitle: "",
    flashSaleDescription: "",
    eventTitle: "",
    eventDescription: "",
    eventImage: "",
    contactPhone: "",
    contactEmail: "",
    contactAddress: "",
    copyrightText: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        promoVideoUrl: settings.promoVideoUrl || "/videos/promo-video.mp4",
        promoTitle: settings.promoTitle || "Watch & Earn",
        promoSubtitle: settings.promoSubtitle || "ODELADS",
        marqueeText: settings.marqueeText || "EARN MORE TODAY >>> CLICK ADS & WIN >>> RATING ADS",
        flashSaleTitle: settings.flashSaleTitle || "Flash",
        flashSaleSubtitle: settings.flashSaleSubtitle || "Sale",
        flashSaleDescription: settings.flashSaleDescription || "Limited time offer - Don't miss out!",
        eventTitle: settings.eventTitle || "Event Space",
        eventDescription: settings.eventDescription || "Join exclusive events, webinars, and community gatherings.",
        eventImage: settings.eventImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        contactPhone: settings.contactPhone || "+94 11 123 4567",
        contactEmail: settings.contactEmail || "support@odelads.com",
        contactAddress: settings.contactAddress || "123 Business Street, Colombo, Sri Lanka",
        copyrightText: settings.copyrightText || "Copyright 2026 ODEL-ADS. All rights reserved.",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const settings = Object.entries(data).map(([key, value]) => ({ key, value }));
      return apiRequest("POST", "/api/settings/bulk", { settings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
  });

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 text-center text-zinc-400">Loading settings...</div>
      </AdminLayout>
    );
  }

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Dashboard Settings</h1>
          <Button 
            onClick={() => saveMutation.mutate(formData)}
            disabled={saveMutation.isPending}
            className="bg-orange-500 hover:bg-orange-600"
            data-testid="button-save-settings"
          >
            <Save className="w-4 h-4 mr-2" />
            Save All Settings
          </Button>
        </div>

        {/* Promo Video */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-500">Promo Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Video URL</Label>
              <Input
                value={formData.promoVideoUrl}
                onChange={(e) => handleChange("promoVideoUrl", e.target.value)}
                placeholder="/videos/promo-video.mp4 or external URL"
                className="bg-zinc-800 border-zinc-700"
                data-testid="input-promo-video"
              />
              <p className="text-xs text-zinc-500 mt-1">Enter a URL to a video file (MP4 recommended)</p>
            </div>
            {formData.promoVideoUrl && (
              <div className="mt-2">
                <Label className="mb-2 block">Preview</Label>
                <video 
                  src={formData.promoVideoUrl}
                  controls
                  muted
                  className="w-full max-w-md rounded-lg h-48 object-cover"
                />
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Video Overlay Title</Label>
                <Input
                  value={formData.promoTitle}
                  onChange={(e) => handleChange("promoTitle", e.target.value)}
                  placeholder="Watch & Earn"
                  className="bg-zinc-800 border-zinc-700"
                  data-testid="input-promo-title"
                />
              </div>
              <div>
                <Label>Video Overlay Subtitle</Label>
                <Input
                  value={formData.promoSubtitle}
                  onChange={(e) => handleChange("promoSubtitle", e.target.value)}
                  placeholder="ODELADS"
                  className="bg-zinc-800 border-zinc-700"
                  data-testid="input-promo-subtitle"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marquee Banner */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-500">Marquee Banner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Marquee Text</Label>
              <Textarea
                value={formData.marqueeText}
                onChange={(e) => handleChange("marqueeText", e.target.value)}
                placeholder="Use >>> to separate items"
                className="bg-zinc-800 border-zinc-700"
                data-testid="input-marquee-text"
              />
              <p className="text-xs text-zinc-500 mt-1">Use &gt;&gt;&gt; to separate scrolling text items</p>
            </div>
          </CardContent>
        </Card>

        {/* Flash Sale */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-500">Flash Sale Countdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Title (White Text)</Label>
                <Input
                  value={formData.flashSaleTitle}
                  onChange={(e) => handleChange("flashSaleTitle", e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                  data-testid="input-flash-title"
                />
              </div>
              <div>
                <Label>Subtitle (Orange Text)</Label>
                <Input
                  value={formData.flashSaleSubtitle}
                  onChange={(e) => handleChange("flashSaleSubtitle", e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                  data-testid="input-flash-subtitle"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.flashSaleDescription}
                onChange={(e) => handleChange("flashSaleDescription", e.target.value)}
                className="bg-zinc-800 border-zinc-700"
                data-testid="input-flash-description"
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Space */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-500">Event Space Banner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Event Title</Label>
              <Input
                value={formData.eventTitle}
                onChange={(e) => handleChange("eventTitle", e.target.value)}
                className="bg-zinc-800 border-zinc-700"
                data-testid="input-event-title"
              />
            </div>
            <div>
              <Label>Event Description</Label>
              <Textarea
                value={formData.eventDescription}
                onChange={(e) => handleChange("eventDescription", e.target.value)}
                className="bg-zinc-800 border-zinc-700"
                data-testid="input-event-description"
              />
            </div>
            <div>
              <Label>Event Image URL</Label>
              <Input
                value={formData.eventImage}
                onChange={(e) => handleChange("eventImage", e.target.value)}
                className="bg-zinc-800 border-zinc-700"
                data-testid="input-event-image"
              />
              {formData.eventImage && (
                <img src={formData.eventImage} alt="Event preview" className="mt-2 h-32 object-cover rounded-lg" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-500">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={formData.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                  data-testid="input-contact-phone"
                />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input
                  value={formData.contactEmail}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                  data-testid="input-contact-email"
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Textarea
                value={formData.contactAddress}
                onChange={(e) => handleChange("contactAddress", e.target.value)}
                className="bg-zinc-800 border-zinc-700"
                data-testid="input-contact-address"
              />
            </div>
          </CardContent>
        </Card>

        {/* Copyright */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-500">Footer Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Copyright Text</Label>
              <Input
                value={formData.copyrightText}
                onChange={(e) => handleChange("copyrightText", e.target.value)}
                className="bg-zinc-800 border-zinc-700"
                data-testid="input-copyright"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
