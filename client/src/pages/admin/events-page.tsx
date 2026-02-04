import { useState, useEffect } from "react";
import {
  Calendar, Save, Plus, Trash2, Edit, Eye, Gift, Sparkles, Star,
  PartyPopper, Clock, CheckCircle, Loader2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: number;
  title: string;
  description: string;
  icon: string;
  iconBgColor: string;
  borderColor: string;
  status: "active" | "coming_soon" | "ended";
  order: number;
}

export default function AdminEventsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Banner Settings
  const [bannerSettings, setBannerSettings] = useState({
    title: "Special Events & Promotions",
    subtitle: "Don't miss out on exciting rewards!",
    gradientFrom: "#a855f7",
    gradientTo: "#ec4899",
    showIcon: true
  });

  // Events List
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: "Welcome Bonus",
      description: "Get LKR 25,000 bonus on your first day!",
      icon: "gift",
      iconBgColor: "#10b98120",
      borderColor: "#4b5563",
      status: "active",
      order: 1
    },
    {
      id: 2,
      title: "Daily Rewards",
      description: "Complete ads daily to earn milestone rewards",
      icon: "sparkles",
      iconBgColor: "#f59e0b20",
      borderColor: "#f59e0b",
      status: "active",
      order: 2
    },
    {
      id: 3,
      title: "Weekly Bonus",
      description: "Extra rewards for active users every week",
      icon: "calendar",
      iconBgColor: "#3b82f620",
      borderColor: "#4b5563",
      status: "coming_soon",
      order: 3
    }
  ]);

  // Status Badge Settings
  const [statusSettings, setStatusSettings] = useState({
    activeText: "Active",
    activeColor: "#10b981",
    comingSoonText: "Coming Soon",
    comingSoonColor: "#f59e0b",
    endedText: "Ended",
    endedColor: "#6b7280"
  });

  const { data: contentData, isLoading } = useQuery({
    queryKey: ["admin-content", "events-page"],
    queryFn: () => api.getContent("events-page"),
  });

  useEffect(() => {
    if (contentData && contentData.length > 0) {
      try {
        const content = contentData[0];
        if (content.metadata) {
          const parsed = typeof content.metadata === 'string' ? JSON.parse(content.metadata) : content.metadata;
          if (parsed.bannerSettings) setBannerSettings(prev => ({ ...prev, ...parsed.bannerSettings }));
          if (parsed.events) setEvents(parsed.events);
          if (parsed.statusSettings) setStatusSettings(prev => ({ ...prev, ...parsed.statusSettings }));
        }
      } catch (e) {
        console.error("Failed to parse events page settings:", e);
      }
    }
  }, [contentData]);

  const mutation = useMutation({
    mutationFn: (data: any) => api.updateContent("events-page", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content", "events-page"] });
      toast({ title: "Events page settings saved!" });
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
    },
  });

  const handleSaveAll = () => {
    mutation.mutate({
      section: "main",
      title: "Events Page Settings",
      content: "",
      metadata: JSON.stringify({ bannerSettings, events, statusSettings }),
    });
  };

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const iconOptions = [
    { value: "gift", label: "🎁 Gift", component: Gift },
    { value: "sparkles", label: "✨ Sparkles", component: Sparkles },
    { value: "calendar", label: "📅 Calendar", component: Calendar },
    { value: "star", label: "⭐ Star", component: Star },
    { value: "party", label: "🎉 Party", component: PartyPopper },
    { value: "clock", label: "⏰ Clock", component: Clock },
  ];

  const getIconComponent = (iconName: string) => {
    const found = iconOptions.find(i => i.value === iconName);
    return found ? found.component : Gift;
  };

  const addNewEvent = () => {
    const newEvent: Event = {
      id: Date.now(),
      title: "New Event",
      description: "Event description here",
      icon: "gift",
      iconBgColor: "#10b98120",
      borderColor: "#4b5563",
      status: "coming_soon",
      order: events.length + 1
    };
    setEvents([...events, newEvent]);
    setEditingEvent(newEvent);
    setIsCreating(true);
  };

  const deleteEvent = (id: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setEvents(events.filter(e => e.id !== id));
    if (editingEvent?.id === id) {
      setEditingEvent(null);
      setIsCreating(false);
    }
  };

  const saveEvent = () => {
    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? editingEvent : e));
    }
    setEditingEvent(null);
    setIsCreating(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return { text: statusSettings.activeText, color: statusSettings.activeColor };
      case "coming_soon": return { text: statusSettings.comingSoonText, color: statusSettings.comingSoonColor };
      case "ended": return { text: statusSettings.endedText, color: statusSettings.endedColor };
      default: return { text: "Unknown", color: "#6b7280" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center">
            <PartyPopper className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Events & Promotions</h1>
            <p className="text-[#9ca3af]">Manage special events and promotional offers</p>
          </div>
        </div>
        <button onClick={handleSaveAll} disabled={mutation.isPending} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
          {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save All Changes
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#a855f7]" />
        </div>
      ) : (
      <>
      {/* Preview */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-[#3b82f6]" /> Live Preview
        </h3>
        
        {/* Banner Preview */}
        <div 
          className="rounded-xl p-8 mb-4 text-center border-2 border-[#8b5cf6]"
          style={{ background: `linear-gradient(135deg, ${bannerSettings.gradientFrom}, ${bannerSettings.gradientTo})` }}
        >
          {bannerSettings.showIcon && <PartyPopper className="h-8 w-8 text-white mx-auto mb-3" />}
          <h2 className="text-xl font-bold text-white mb-1">{bannerSettings.title}</h2>
          <p className="text-white/80">{bannerSettings.subtitle}</p>
        </div>

        {/* Events Preview */}
        <div className="space-y-3">
          {events.map(event => {
            const IconComponent = getIconComponent(event.icon);
            const badge = getStatusBadge(event.status);
            return (
              <div 
                key={event.id}
                className="flex items-center gap-4 p-4 bg-[#0f1419] rounded-xl border-2"
                style={{ borderColor: event.borderColor }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: event.iconBgColor }}>
                  <IconComponent className="h-6 w-6" style={{ color: event.borderColor === "#4b5563" ? "#9ca3af" : event.borderColor }} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{event.title}</h4>
                  <p className="text-[#9ca3af] text-sm">{event.description}</p>
                </div>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
                >
                  {badge.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Banner Settings */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#a855f7]" /> Banner Settings
          </h3>
          <div className="space-y-4">
            <div><label className="block text-sm text-[#9ca3af] mb-2">Banner Title</label><input type="text" value={bannerSettings.title} onChange={(e) => setBannerSettings({...bannerSettings, title: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
            <div><label className="block text-sm text-[#9ca3af] mb-2">Subtitle</label><input type="text" value={bannerSettings.subtitle} onChange={(e) => setBannerSettings({...bannerSettings, subtitle: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-[#9ca3af] mb-2">Gradient From</label><div className="flex gap-2"><input type="color" value={bannerSettings.gradientFrom} onChange={(e) => setBannerSettings({...bannerSettings, gradientFrom: e.target.value})} className="w-10 h-10 rounded cursor-pointer" /><input type="text" value={bannerSettings.gradientFrom} onChange={(e) => setBannerSettings({...bannerSettings, gradientFrom: e.target.value})} className="flex-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none" /></div></div>
              <div><label className="block text-sm text-[#9ca3af] mb-2">Gradient To</label><div className="flex gap-2"><input type="color" value={bannerSettings.gradientTo} onChange={(e) => setBannerSettings({...bannerSettings, gradientTo: e.target.value})} className="w-10 h-10 rounded cursor-pointer" /><input type="text" value={bannerSettings.gradientTo} onChange={(e) => setBannerSettings({...bannerSettings, gradientTo: e.target.value})} className="flex-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none" /></div></div>
            </div>
            <div className="flex items-center justify-between py-2"><span className="text-[#9ca3af]">Show Icon</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={bannerSettings.showIcon} onChange={(e) => setBannerSettings({...bannerSettings, showIcon: e.target.checked})} className="sr-only peer" /><div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label></div>
          </div>
        </div>

        {/* Status Badge Settings */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[#10b981]" /> Status Badges
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-[#9ca3af] mb-2">Active Text</label><input type="text" value={statusSettings.activeText} onChange={(e) => setStatusSettings({...statusSettings, activeText: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
              <div><label className="block text-sm text-[#9ca3af] mb-2">Active Color</label><div className="flex gap-2"><input type="color" value={statusSettings.activeColor} onChange={(e) => setStatusSettings({...statusSettings, activeColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer" /><input type="text" value={statusSettings.activeColor} onChange={(e) => setStatusSettings({...statusSettings, activeColor: e.target.value})} className="flex-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none" /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-[#9ca3af] mb-2">Coming Soon Text</label><input type="text" value={statusSettings.comingSoonText} onChange={(e) => setStatusSettings({...statusSettings, comingSoonText: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
              <div><label className="block text-sm text-[#9ca3af] mb-2">Coming Soon Color</label><div className="flex gap-2"><input type="color" value={statusSettings.comingSoonColor} onChange={(e) => setStatusSettings({...statusSettings, comingSoonColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer" /><input type="text" value={statusSettings.comingSoonColor} onChange={(e) => setStatusSettings({...statusSettings, comingSoonColor: e.target.value})} className="flex-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none" /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-[#9ca3af] mb-2">Ended Text</label><input type="text" value={statusSettings.endedText} onChange={(e) => setStatusSettings({...statusSettings, endedText: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
              <div><label className="block text-sm text-[#9ca3af] mb-2">Ended Color</label><div className="flex gap-2"><input type="color" value={statusSettings.endedColor} onChange={(e) => setStatusSettings({...statusSettings, endedColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer" /><input type="text" value={statusSettings.endedColor} onChange={(e) => setStatusSettings({...statusSettings, endedColor: e.target.value})} className="flex-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none" /></div></div>
            </div>
          </div>
        </div>

        {/* Edit Event Form */}
        {editingEvent && (
          <div className="bg-[#1a2332] rounded-2xl border border-[#10b981] p-6 lg:col-span-2">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Edit className="h-5 w-5 text-[#10b981]" /> {isCreating ? "Create New Event" : "Edit Event"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div><label className="block text-sm text-[#9ca3af] mb-2">Event Title</label><input type="text" value={editingEvent.title} onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" /></div>
                <div><label className="block text-sm text-[#9ca3af] mb-2">Description</label><textarea value={editingEvent.description} onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none min-h-[80px]" /></div>
                <div><label className="block text-sm text-[#9ca3af] mb-2">Icon</label><select value={editingEvent.icon} onChange={(e) => setEditingEvent({...editingEvent, icon: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none">{iconOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
              </div>
              <div className="space-y-4">
                <div><label className="block text-sm text-[#9ca3af] mb-2">Status</label><select value={editingEvent.status} onChange={(e) => setEditingEvent({...editingEvent, status: e.target.value as any})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none"><option value="active">Active</option><option value="coming_soon">Coming Soon</option><option value="ended">Ended</option></select></div>
                <div><label className="block text-sm text-[#9ca3af] mb-2">Border Color</label><div className="flex gap-2"><input type="color" value={editingEvent.borderColor} onChange={(e) => setEditingEvent({...editingEvent, borderColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer" /><input type="text" value={editingEvent.borderColor} onChange={(e) => setEditingEvent({...editingEvent, borderColor: e.target.value})} className="flex-1 px-3 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white text-sm font-mono outline-none" /></div></div>
                <div className="flex gap-3 pt-4">
                  <button onClick={saveEvent} className="flex-1 py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center justify-center gap-2"><Save className="h-5 w-5" /> Save Event</button>
                  <button onClick={() => { setEditingEvent(null); setIsCreating(false); }} className="px-6 py-3 bg-transparent border border-[#2a3a4d] text-[#9ca3af] rounded-xl">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Events List */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#f59e0b]" /> All Events ({events.length})
          </h3>
          <button onClick={addNewEvent} className="px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-xl text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add New Event
          </button>
        </div>
        
        <div className="space-y-3">
          {events.map((event, index) => {
            const IconComponent = getIconComponent(event.icon);
            const badge = getStatusBadge(event.status);
            return (
              <div key={event.id} className="flex items-center gap-4 p-4 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
                <span className="text-[#6b7280] text-sm w-6">{index + 1}.</span>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: event.iconBgColor }}>
                  <IconComponent className="h-5 w-5" style={{ color: event.borderColor === "#4b5563" ? "#9ca3af" : event.borderColor }} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{event.title}</h4>
                  <p className="text-[#6b7280] text-sm truncate">{event.description}</p>
                </div>
                <span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: `${badge.color}20`, color: badge.color }}>{badge.text}</span>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingEvent(event); setIsCreating(false); }} className="w-8 h-8 bg-[#3b82f6]/20 text-[#3b82f6] rounded-lg flex items-center justify-center"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => deleteEvent(event.id)} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
