import { useState, useEffect } from "react";
import { Images, Save, Plus, Trash2, Upload, GripVertical, Eye, EyeOff } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Slide {
  id: number;
  title: string;
  imageUrl: string;
  link: string;
  sortOrder: number;
  isActive: boolean;
}

export default function Slideshow() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    enabled: true,
    autoplay: true,
    interval: 5000,
    showDots: true,
    showArrows: true,
  });

  const [slides, setSlides] = useState<Slide[]>([]);

  const { data: savedSlides, isLoading } = useQuery<Slide[]>({
    queryKey: ["/api/admin/settings/slideshow"],
  });

  useEffect(() => {
    if (savedSlides && Array.isArray(savedSlides)) {
      setSlides(savedSlides);
    }
  }, [savedSlides]);

  const saveMutation = useMutation({
    mutationFn: async (slide: Partial<Slide>) => {
      if (slide.id && slide.id > 0) {
        return apiRequest("PUT", `/api/admin/settings/slideshow/${slide.id}`, {
          title: slide.title,
          link: slide.link,
          sortOrder: slide.sortOrder,
          isActive: slide.isActive
        });
      } else {
        return apiRequest("POST", "/api/admin/settings/slideshow", {
          title: slide.title,
          link: slide.link || "",
          sortOrder: slides.length
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/slideshow"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/settings/slideshow/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/slideshow"] });
      toast({ title: "Deleted", description: "Slide removed" });
    }
  });

  const handleSave = async () => {
    try {
      for (const slide of slides) {
        await saveMutation.mutateAsync(slide);
      }
      toast({ title: "Success", description: "Slideshow settings saved!" });
    } catch {
      toast({ title: "Error", description: "Failed to save slides", variant: "destructive" });
    }
  };

  const addSlide = () => {
    setSlides([...slides, {
      id: -Date.now(),
      title: "New Slide",
      imageUrl: "",
      link: "",
      sortOrder: slides.length,
      isActive: true
    }]);
  };

  const deleteSlide = (id: number) => {
    if (id > 0) {
      deleteMutation.mutate(id);
    }
    setSlides(slides.filter(s => s.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ec4899]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ec4899] to-[#be185d] flex items-center justify-center">
            <Images className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Slideshow Images</h1>
            <p className="text-[#9ca3af]">Manage homepage slideshow</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={addSlide} className="px-5 py-2.5 bg-[#3b82f6] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
            <Plus className="h-5 w-5" /> Add Slide
          </button>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-5 w-5" /> {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold">Slideshow Settings</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <span className="text-[#9ca3af] text-sm">Enable</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.enabled} onChange={(e) => setSettings({...settings, enabled: e.target.checked})} className="sr-only peer" />
                <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <span className="text-[#9ca3af] text-sm">Autoplay</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.autoplay} onChange={(e) => setSettings({...settings, autoplay: e.target.checked})} className="sr-only peer" />
                <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
            <div className="p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <label className="block text-xs text-[#6b7280] mb-1">Interval (ms)</label>
              <input type="number" value={settings.interval} onChange={(e) => setSettings({...settings, interval: parseInt(e.target.value) || 0})} className="w-full px-2 py-1 bg-[#1a2332] border border-[#2a3a4d] rounded text-white text-sm outline-none" />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <span className="text-[#9ca3af] text-sm">Dots</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.showDots} onChange={(e) => setSettings({...settings, showDots: e.target.checked})} className="sr-only peer" />
                <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
              <span className="text-[#9ca3af] text-sm">Arrows</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.showArrows} onChange={(e) => setSettings({...settings, showArrows: e.target.checked})} className="sr-only peer" />
                <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Slides */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold">Slides ({slides.length})</h3>
        </div>
        <div className="p-6 space-y-4">
          {slides.length === 0 ? (
            <p className="text-center text-[#6b7280] py-8">No slides added yet. Click "Add Slide" to create one.</p>
          ) : (
            slides.map((slide, index) => (
              <div key={slide.id} className="flex gap-4 p-4 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                <div className="flex items-center">
                  <GripVertical className="h-5 w-5 text-[#6b7280] cursor-move" />
                </div>
                <div className="w-32 h-20 bg-[#2a3a4d] rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                  {slide.imageUrl ? (
                    <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="h-6 w-6 text-[#6b7280]" />
                  )}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">Title</label>
                    <input type="text" value={slide.title} onChange={(e) => setSlides(slides.map(s => s.id === slide.id ? {...s, title: e.target.value} : s))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">Link URL</label>
                    <input type="text" value={slide.link} onChange={(e) => setSlides(slides.map(s => s.id === slide.id ? {...s, link: e.target.value} : s))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" placeholder="/page or https://..." />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-[#6b7280] mb-1">Image URL</label>
                    <input type="text" value={slide.imageUrl} onChange={(e) => setSlides(slides.map(s => s.id === slide.id ? {...s, imageUrl: e.target.value} : s))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" placeholder="https://..." />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setSlides(slides.map(s => s.id === slide.id ? {...s, isActive: !s.isActive} : s))} className={`w-8 h-8 rounded-lg flex items-center justify-center ${slide.isActive ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#6b7280]/20 text-[#6b7280]"}`}>
                    {slide.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => deleteSlide(slide.id)} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
