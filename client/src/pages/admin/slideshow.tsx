import { useState } from "react";
import { Images, Save, Plus, Trash2, Upload, GripVertical, Eye, EyeOff } from "lucide-react";

export default function Slideshow() {
  const [settings, setSettings] = useState({
    enabled: true,
    autoplay: true,
    interval: 5000,
    showDots: true,
    showArrows: true,
  });

  const [slides, setSlides] = useState([
    { id: 1, title: "Welcome to ODEL-ADS", subtitle: "Earn money by watching ads", image: "", link: "", enabled: true },
    { id: 2, title: "Daily Rewards", subtitle: "Complete tasks and earn bonuses", image: "", link: "/rewards", enabled: true },
    { id: 3, title: "Refer & Earn", subtitle: "Invite friends and earn commission", image: "", link: "/referral", enabled: true },
  ]);

  const handleSave = () => alert("Slideshow settings saved!");

  const addSlide = () => {
    setSlides([...slides, { id: Date.now(), title: "New Slide", subtitle: "", image: "", link: "", enabled: true }]);
  };

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
          <button onClick={handleSave} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
            <Save className="h-5 w-5" /> Save
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
          {slides.map((slide, index) => (
            <div key={slide.id} className="flex gap-4 p-4 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
              <div className="flex items-center">
                <GripVertical className="h-5 w-5 text-[#6b7280] cursor-move" />
              </div>
              <div className="w-32 h-20 bg-[#2a3a4d] rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                {slide.image ? (
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
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
                  <label className="block text-xs text-[#6b7280] mb-1">Subtitle</label>
                  <input type="text" value={slide.subtitle} onChange={(e) => setSlides(slides.map(s => s.id === slide.id ? {...s, subtitle: e.target.value} : s))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1">Image URL</label>
                  <input type="text" value={slide.image} onChange={(e) => setSlides(slides.map(s => s.id === slide.id ? {...s, image: e.target.value} : s))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1">Link URL</label>
                  <input type="text" value={slide.link} onChange={(e) => setSlides(slides.map(s => s.id === slide.id ? {...s, link: e.target.value} : s))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" placeholder="/page or https://..." />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => setSlides(slides.map(s => s.id === slide.id ? {...s, enabled: !s.enabled} : s))} className={`w-8 h-8 rounded-lg flex items-center justify-center ${slide.enabled ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#6b7280]/20 text-[#6b7280]"}`}>
                  {slide.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => setSlides(slides.filter(s => s.id !== slide.id))} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
