import { useState } from "react";
import { Phone, Save, Plus, Trash2, Globe } from "lucide-react";

export default function ContactPhone() {
  const [phones, setPhones] = useState([
    { id: 1, label: "Main Office", number: "+94 11 123 4567", enabled: true },
    { id: 2, label: "Support", number: "+94 77 123 4567", enabled: true },
  ]);

  const handleSave = () => alert("Phone settings saved!");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Phone Numbers</h1>
            <p className="text-[#9ca3af]">Manage contact phone numbers</p>
          </div>
        </div>
        <button onClick={handleSave} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
          <Save className="h-5 w-5" /> Save
        </button>
      </div>

      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold flex items-center gap-2"><Phone className="h-5 w-5 text-[#10b981]" /> Phone Numbers</h3>
          <button onClick={() => setPhones([...phones, { id: Date.now(), label: "New", number: "", enabled: true }])} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="p-6 space-y-4">
          {phones.map((phone) => (
            <div key={phone.id} className="flex items-center gap-4 p-4 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#10b981]/20 flex items-center justify-center">
                <Phone className="h-5 w-5 text-[#10b981]" />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1">Label</label>
                  <input type="text" value={phone.label} onChange={(e) => setPhones(phones.map(p => p.id === phone.id ? {...p, label: e.target.value} : p))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1">Phone Number</label>
                  <input type="text" value={phone.number} onChange={(e) => setPhones(phones.map(p => p.id === phone.id ? {...p, number: e.target.value} : p))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" placeholder="+94 XX XXX XXXX" />
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={phone.enabled} onChange={(e) => setPhones(phones.map(p => p.id === phone.id ? {...p, enabled: e.target.checked} : p))} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
              <button onClick={() => setPhones(phones.filter(p => p.id !== phone.id))} className="w-10 h-10 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
