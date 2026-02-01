import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Home, LayoutDashboard, Image, Save, Loader2, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface SlideImage {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  display_order: number;
  is_active: number;
  page: string;
}

export default function AdminSiteContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Home Page State
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");

  // Dashboard State
  const [dashboardWelcome, setDashboardWelcome] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");

  // Slideshow State
  const [slidePage, setSlidePage] = useState("home");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSlide, setNewSlide] = useState({ title: "", image_url: "", link_url: "" });

  // Fetch home settings
  const { isLoading: loadingHome } = useQuery({
    queryKey: ["/api/admin/settings/home"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings/home", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setHeroTitle(data.hero_title || "");
      setHeroSubtitle(data.hero_subtitle || "");
      setWelcomeMessage(data.welcome_message || "");
      return data;
    },
  });

  // Fetch dashboard settings
  const { isLoading: loadingDashboard } = useQuery({
    queryKey: ["/api/admin/settings/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings/dashboard", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setDashboardWelcome(data.welcome_text || "");
      setCurrencySymbol(data.currency_symbol || "Rs.");
      return data;
    },
  });

  // Fetch slideshow
  const { data: slides = [], isLoading: loadingSlides } = useQuery<SlideImage[]>({
    queryKey: ["/api/admin/slideshow", slidePage],
    queryFn: async () => {
      const res = await fetch(`/api/admin/slideshow?page=${slidePage}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  // Save home
  const saveHome = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/settings/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ hero_title: heroTitle, hero_subtitle: heroSubtitle, welcome_message: welcomeMessage }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => toast({ title: "✅ Saved!", description: "Home page updated." }),
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to save." }),
  });

  // Save dashboard
  const saveDashboard = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/settings/dashboard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ welcome_text: dashboardWelcome, currency_symbol: currencySymbol }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => toast({ title: "✅ Saved!", description: "Dashboard settings updated." }),
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to save." }),
  });

  // Add slide
  const addSlide = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/slideshow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...newSlide, page: slidePage }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Added!", description: "Slideshow image added." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slideshow"] });
      setShowAddDialog(false);
      setNewSlide({ title: "", image_url: "", link_url: "" });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to add." }),
  });

  // Delete slide
  const deleteSlide = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/slideshow/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "🗑️ Deleted!", description: "Image removed." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slideshow"] });
    },
  });

  // Toggle slide visibility
  const toggleSlide = useMutation({
    mutationFn: async ({ id, slide }: { id: number; slide: SlideImage }) => {
      const res = await fetch(`/api/admin/slideshow/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...slide, is_active: slide.is_active ? 0 : 1 }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/slideshow"] }),
  });

  const isLoading = loadingHome || loadingDashboard || loadingSlides;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#B8936B]">🧩 Site Content</h1>
        <p className="text-gray-400">Manage website content, text and images</p>
      </div>

      <Tabs defaultValue="home" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-[#1a2332]">
          <TabsTrigger value="home" className="data-[state=active]:bg-amber-600">🏠 Home Page</TabsTrigger>
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-amber-600">📊 Dashboard</TabsTrigger>
          <TabsTrigger value="slideshow" className="data-[state=active]:bg-amber-600">🖼️ Slideshow</TabsTrigger>
        </TabsList>

        {/* Home Page Tab */}
        <TabsContent value="home">
          <Card className="bg-[#1a2332] border-[#2a3a4d]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Home className="h-5 w-5 text-amber-500" />
                Home Page Content
              </CardTitle>
              <CardDescription>Edit the main landing page text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Hero Title</Label>
                <Input
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Welcome to OdelADS"
                  className="bg-[#0f1419] border-[#2a3a4d] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Hero Subtitle</Label>
                <Textarea
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Earn money by watching ads"
                  rows={3}
                  className="bg-[#0f1419] border-[#2a3a4d] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Welcome Message</Label>
                <Input
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Hello, welcome to OdelADS!"
                  className="bg-[#0f1419] border-[#2a3a4d] text-white"
                />
              </div>
              <Button onClick={() => saveHome.mutate()} disabled={saveHome.isPending} className="w-full bg-amber-600 hover:bg-amber-700">
                {saveHome.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Home Page
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <Card className="bg-[#1a2332] border-[#2a3a4d]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <LayoutDashboard className="h-5 w-5 text-amber-500" />
                Dashboard Content
              </CardTitle>
              <CardDescription>Edit user dashboard text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Welcome Text</Label>
                <Input
                  value={dashboardWelcome}
                  onChange={(e) => setDashboardWelcome(e.target.value)}
                  placeholder="Hello, welcome to OdelADS!"
                  className="bg-[#0f1419] border-[#2a3a4d] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Currency Symbol</Label>
                <Input
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  placeholder="Rs."
                  className="bg-[#0f1419] border-[#2a3a4d] text-white w-32"
                />
              </div>
              <Button onClick={() => saveDashboard.mutate()} disabled={saveDashboard.isPending} className="w-full bg-amber-600 hover:bg-amber-700">
                {saveDashboard.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Dashboard Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Slideshow Tab */}
        <TabsContent value="slideshow">
          <Card className="bg-[#1a2332] border-[#2a3a4d]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Image className="h-5 w-5 text-amber-500" />
                    Slideshow Images
                  </CardTitle>
                  <CardDescription>Manage banner images</CardDescription>
                </div>
                <div className="flex gap-2">
                  <select
                    value={slidePage}
                    onChange={(e) => setSlidePage(e.target.value)}
                    className="px-3 py-2 rounded-md border bg-[#0f1419] border-[#2a3a4d] text-white"
                  >
                    <option value="home">Home Page</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="login">Login Page</option>
                  </select>
                  <Button onClick={() => setShowAddDialog(true)} className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="h-4 w-4 mr-2" /> Add Image
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slides.map((slide) => (
                  <div key={slide.id} className="relative group border border-[#2a3a4d] rounded-lg overflow-hidden">
                    <img src={slide.image_url} alt={slide.title} className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleSlide.mutate({ id: slide.id, slide })}
                      >
                        {slide.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteSlide.mutate(slide.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-2 bg-[#0f1419]">
                      <p className="font-medium text-white truncate">{slide.title || "Untitled"}</p>
                      <p className="text-xs text-gray-400">{slide.is_active ? "✅ Active" : "❌ Hidden"}</p>
                    </div>
                  </div>
                ))}
                {slides.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    No images yet. Click "Add Image" to create one.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Image Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#1a2332] border-[#2a3a4d]">
          <DialogHeader>
            <DialogTitle className="text-white">Add Slideshow Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Title</Label>
              <Input
                value={newSlide.title}
                onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                placeholder="Banner title"
                className="bg-[#0f1419] border-[#2a3a4d] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Image URL</Label>
              <Input
                value={newSlide.image_url}
                onChange={(e) => setNewSlide({ ...newSlide, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="bg-[#0f1419] border-[#2a3a4d] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Link URL (optional)</Label>
              <Input
                value={newSlide.link_url}
                onChange={(e) => setNewSlide({ ...newSlide, link_url: e.target.value })}
                placeholder="https://example.com"
                className="bg-[#0f1419] border-[#2a3a4d] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={() => addSlide.mutate()} disabled={addSlide.isPending || !newSlide.image_url} className="bg-amber-600">
              {addSlide.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
