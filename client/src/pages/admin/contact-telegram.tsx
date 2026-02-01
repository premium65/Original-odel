import { useState } from "react";
import { Send, Save, Plus, Trash2 } from "lucide-react";

export default function ContactTelegram() {
  const [accounts, setAccounts] = useState([
    { id: 1, label: "Official Channel", username: "@odelads", type: "channel", enabled: true },
    { id: 2, label: "Support Bot", username: "@odelads_support_bot", type: "bot", enabled: true },
  ]);

  const handleSave = () => alert("Telegram settings saved!");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0088cc] to-[#0077b5] flex items-center justify-center">
            <Send className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Telegram Contact</h1>
            <p className="text-[#9ca3af]">Manage Telegram accounts and channels</p>
          </div>
        </div>
        <button onClick={handleSave} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
          <Save className="h-5 w-5" /> Save
        </button>
      </div>

      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold flex items-center gap-2"><Send className="h-5 w-5 text-[#0088cc]" /> Telegram Accounts</h3>
          <button onClick={() => setAccounts([...accounts, { id: Date.now(), label: "New", username: "", type: "channel", enabled: true }])} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="p-6 space-y-4">
          {accounts.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#0088cc]/20 flex items-center justify-center">
                <Send className="h-5 w-5 text-[#0088cc]" />
              </div>
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1">Label</label>
                  <input type="text" value={item.label} onChange={(e) => setAccounts(accounts.map(p => p.id === item.id ? {...p, label: e.target.value} : p))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1">Username</label>
                  <input type="text" value={item.username} onChange={(e) => setAccounts(accounts.map(p => p.id === item.id ? {...p, username: e.target.value} : p))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" placeholder="@username" />
                </div>
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1">Type</label>
                  <select value={item.type} onChange={(e) => setAccounts(accounts.map(p => p.id === item.id ? {...p, type: e.target.value} : p))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none">
                    <option value="channel">Channel</option>
                    <option value="group">Group</option>
                    <option value="bot">Bot</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={item.enabled} onChange={(e) => setAccounts(accounts.map(p => p.id === item.id ? {...p, enabled: e.target.checked} : p))} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
              <button onClick={() => setAccounts(accounts.filter(p => p.id !== item.id))} className="w-10 h-10 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
