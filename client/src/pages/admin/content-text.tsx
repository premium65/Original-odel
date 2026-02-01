import { useState } from "react";
import { Type, Save, Search, Globe } from "lucide-react";

export default function ContentText() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [labels, setLabels] = useState([
    { id: 1, key: "welcome_message", value: "Welcome to ODEL-ADS", category: "general", description: "Main welcome text" },
    { id: 2, key: "balance_label", value: "Balance", category: "dashboard", description: "Balance card title" },
    { id: 3, key: "ads_progress", value: "Ads Progress", category: "dashboard", description: "Ads progress card title" },
    { id: 4, key: "account_status", value: "Account Status", category: "dashboard", description: "Status card title" },
    { id: 5, key: "see_all_btn", value: "See all", category: "buttons", description: "See all button text" },
    { id: 6, key: "login_btn", value: "Login", category: "buttons", description: "Login button" },
    { id: 7, key: "signup_btn", value: "Sign Up", category: "buttons", description: "Sign up button" },
    { id: 8, key: "withdraw_btn", value: "Withdraw", category: "buttons", description: "Withdrawal button" },
    { id: 9, key: "locked_text", value: "Locked", category: "status", description: "Locked status text" },
    { id: 10, key: "active_text", value: "Active", category: "status", description: "Active status text" },
    { id: 11, key: "pending_text", value: "Pending", category: "status", description: "Pending status text" },
    { id: 12, key: "currency_symbol", value: "LKR", category: "general", description: "Currency symbol" },
    { id: 13, key: "ads_required_msg", value: "{count} more ads needed to unlock", category: "messages", description: "Ads required message" },
    { id: 14, key: "welcome_bonus_msg", value: "Get LKR 25,000 bonus on your first day!", category: "messages", description: "Welcome bonus message" },
  ]);

  const categories = ["all", "general", "dashboard", "buttons", "status", "messages"];

  const handleSave = () => alert("Labels saved!");

  const filteredLabels = labels.filter(label => 
    (selectedCategory === "all" || label.category === selectedCategory) &&
    (label.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
     label.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
     label.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center">
            <Type className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Text & Labels</h1>
            <p className="text-[#9ca3af]">Manage all text content and labels</p>
          </div>
        </div>
        <button onClick={handleSave} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90">
          <Save className="h-5 w-5" /> Save All
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6b7280]" />
            <input type="text" placeholder="Search labels..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  selectedCategory === cat 
                    ? "bg-[#6366f1] text-white" 
                    : "bg-[#0f1419] text-[#9ca3af] hover:bg-[#2a3a4d]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Labels List */}
      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#6366f1]" /> Labels ({filteredLabels.length})
          </h3>
        </div>
        <div className="divide-y divide-[#2a3a4d]">
          {filteredLabels.map((label) => (
            <div key={label.id} className="p-4 hover:bg-white/5">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="px-2 py-1 bg-[#0f1419] text-[#6366f1] text-sm rounded font-mono">{label.key}</code>
                    <span className="px-2 py-0.5 bg-[#2a3a4d] text-[#9ca3af] text-xs rounded capitalize">{label.category}</span>
                  </div>
                  <p className="text-[#6b7280] text-sm mb-2">{label.description}</p>
                </div>
                <div className="w-1/2">
                  <input 
                    type="text" 
                    value={label.value} 
                    onChange={(e) => setLabels(labels.map(l => l.id === label.id ? {...l, value: e.target.value} : l))}
                    className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg text-white outline-none focus:border-[#6366f1]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-[#1a2332]/50 rounded-xl border border-[#2a3a4d] p-4">
        <p className="text-[#9ca3af] text-sm">
          <strong className="text-white">Note:</strong> Use {"{count}"}, {"{name}"}, {"{amount}"} as placeholders in messages. 
          These will be replaced with actual values when displayed to users.
        </p>
      </div>
    </div>
  );
}
