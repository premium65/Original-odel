import { useState } from "react";
import { Shield, Save, Plus, Trash2, GripVertical } from "lucide-react";

export default function InfoPrivacy() {
  const [pageTitle, setPageTitle] = useState("Privacy Policy");
  const [lastUpdated, setLastUpdated] = useState("2024-01-15");
  
  const [sections, setSections] = useState([
    { id: 1, title: "Information We Collect", content: "We collect information you provide directly, such as name, email, and phone number. We also collect usage data including IP address and device information." },
    { id: 2, title: "How We Use Your Information", content: "We use your information to provide and improve our services, process transactions, send notifications, and comply with legal obligations." },
    { id: 3, title: "Data Security", content: "We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or destruction." },
    { id: 4, title: "Your Rights", content: "You have the right to access, correct, or delete your personal data. Contact us at privacy@odelads.com for any requests." },
  ]);

  const handleSave = () => alert("Privacy Policy saved!");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
            <p className="text-[#9ca3af]">Edit privacy policy content</p>
          </div>
        </div>
        <button onClick={handleSave} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
          <Save className="h-5 w-5" /> Save
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
          <div className="px-6 py-4 border-b border-[#2a3a4d]">
            <h3 className="text-white font-semibold">Page Settings</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Page Title</label>
              <input type="text" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Last Updated</label>
              <input type="date" value={lastUpdated} onChange={(e) => setLastUpdated(e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
            <h3 className="text-white font-semibold">Content Sections</h3>
            <button onClick={() => setSections([...sections, { id: Date.now(), title: "New Section", content: "" }])} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Section
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {sections.map((section, index) => (
              <div key={section.id} className="p-4 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <GripVertical className="h-5 w-5 text-[#6b7280] cursor-move" />
                  <span className="text-[#8b5cf6] font-bold">{index + 1}.</span>
                  <input type="text" value={section.title} onChange={(e) => setSections(sections.map(s => s.id === section.id ? {...s, title: e.target.value} : s))} className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white font-semibold outline-none" />
                  <button onClick={() => setSections(sections.filter(s => s.id !== section.id))} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea value={section.content} onChange={(e) => setSections(sections.map(s => s.id === section.id ? {...s, content: e.target.value} : s))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none resize-none" rows={3} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
