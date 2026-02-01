import { useState } from "react";
import { MessageCircle, Save, Plus, Trash2 } from "lucide-react";

export default function ContactWhatsApp() {
  const [numbers, setNumbers] = useState([
    { id: 1, label: "Customer Support", number: "+94771234567", message: "Hello! I need help with...", enabled: true },
  ]);

  const handleSave = () => alert("WhatsApp settings saved!");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">WhatsApp Contact</h1>
            <p className="text-[#9ca3af]">Manage WhatsApp contact numbers</p>
          </div>
        </div>
        <button onClick={handleSave} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
          <Save className="h-5 w-5" /> Save
        </button>
      </div>

      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold flex items-center gap-2"><MessageCircle className="h-5 w-5 text-[#25d366]" /> WhatsApp Numbers</h3>
          <button onClick={() => setNumbers([...numbers, { id: Date.now(), label: "New", number: "", message: "", enabled: true }])} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="p-6 space-y-4">
          {numbers.map((item) => (
            <div key={item.id} className="p-4 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#25d366]/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-[#25d366]" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">Label</label>
                    <input type="text" value={item.label} onChange={(e) => setNumbers(numbers.map(p => p.id === item.id ? {...p, label: e.target.value} : p))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">WhatsApp Number (with country code)</label>
                    <input type="text" value={item.number} onChange={(e) => setNumbers(numbers.map(p => p.id === item.id ? {...p, number: e.target.value} : p))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" placeholder="+94XXXXXXXXX" />
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={item.enabled} onChange={(e) => setNumbers(numbers.map(p => p.id === item.id ? {...p, enabled: e.target.checked} : p))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
                <button onClick={() => setNumbers(numbers.filter(p => p.id !== item.id))} className="w-10 h-10 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div>
                <label className="block text-xs text-[#6b7280] mb-1">Pre-filled Message (optional)</label>
                <textarea value={item.message} onChange={(e) => setNumbers(numbers.map(p => p.id === item.id ? {...p, message: e.target.value} : p))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none resize-none" rows={2} placeholder="Hello! I need help with..." />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
