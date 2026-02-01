import { useState } from "react";
import { Info, Save, Upload, Image } from "lucide-react";

export default function InfoAbout() {
  const [content, setContent] = useState({
    title: "About Us",
    subtitle: "Learn more about ODEL-ADS",
    heroImage: "",
    mission: "Our mission is to provide a platform where users can earn money by watching and interacting with advertisements.",
    vision: "We envision a world where anyone can earn supplementary income through simple online activities.",
    story: "ODEL-ADS was founded in 2024 with the goal of creating a fair and transparent advertising platform. We connect advertisers with users who are willing to engage with content, creating a win-win situation for everyone involved.",
    showTeam: true,
    teamTitle: "Our Team",
  });

  const [team, setTeam] = useState([
    { id: 1, name: "John Doe", role: "CEO & Founder", image: "" },
    { id: 2, name: "Jane Smith", role: "CTO", image: "" },
  ]);

  const handleSave = () => alert("About Us content saved!");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center">
            <Info className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">About Us Page</h1>
            <p className="text-[#9ca3af]">Edit the About Us page content</p>
          </div>
        </div>
        <button onClick={handleSave} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
          <Save className="h-5 w-5" /> Save
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold">Page Header</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Page Title</label>
                <input type="text" value={content.title} onChange={(e) => setContent({...content, title: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Subtitle</label>
                <input type="text" value={content.subtitle} onChange={(e) => setContent({...content, subtitle: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold">Mission & Vision</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Our Mission</label>
                <textarea value={content.mission} onChange={(e) => setContent({...content, mission: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none resize-none" rows={3} />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Our Vision</label>
                <textarea value={content.vision} onChange={(e) => setContent({...content, vision: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none resize-none" rows={3} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold">Our Story</h3>
            </div>
            <div className="p-6">
              <textarea value={content.story} onChange={(e) => setContent({...content, story: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none resize-none" rows={8} />
            </div>
          </div>

          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold">Team Section</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={content.showTeam} onChange={(e) => setContent({...content, showTeam: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div className="p-6 space-y-4">
              {team.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-[#2a3a4d] flex items-center justify-center">
                    <Image className="h-5 w-5 text-[#6b7280]" />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input type="text" value={member.name} onChange={(e) => setTeam(team.map(t => t.id === member.id ? {...t, name: e.target.value} : t))} className="px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" placeholder="Name" />
                    <input type="text" value={member.role} onChange={(e) => setTeam(team.map(t => t.id === member.id ? {...t, role: e.target.value} : t))} className="px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" placeholder="Role" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
