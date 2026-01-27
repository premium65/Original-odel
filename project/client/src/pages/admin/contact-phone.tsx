import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Phone, Save, Plus, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactSetting {
  id?: number;
  type: string;
  value: string;
  label?: string;
  isActive: boolean;
}

export default function AdminContactPhone() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [phones, setPhones] = useState<ContactSetting[]>([
    { type: "phone", value: "", label: "Main", isActive: true }
  ]);

  const { data: settings = [] } = useQuery<ContactSetting[]>({
    queryKey: ["/api/admin/settings/contact"],
  });

  useEffect(() => {
    const phoneSettings = settings.filter(s => s.type === "phone");
    if (phoneSettings.length > 0) {
      setPhones(phoneSettings);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: ContactSetting[]) => {
      const res = await fetch("/api/admin/settings/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "phone", items: data }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/contact"] });
      toast({ title: "Success", description: "Phone numbers saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save phone numbers", variant: "destructive" });
    },
  });

  const addPhone = () => {
    setPhones([...phones, { type: "phone", value: "", label: "", isActive: true }]);
  };

  const removePhone = (index: number) => {
    setPhones(phones.filter((_, i) => i !== index));
  };

  const updatePhone = (index: number, field: string, value: string | boolean) => {
    const updated = [...phones];
    updated[index] = { ...updated[index], [field]: value };
    setPhones(updated);
  };

  const handleSave = () => {
    saveMutation.mutate(phones);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Phone Numbers</h1>
          <p className="text-[#9ca3af] mt-1">Manage contact phone numbers displayed on your site</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] text-white rounded-xl hover:bg-[#059669] transition-colors"
        >
          <Save className="w-5 h-5" />
          <span className="font-medium">{saveMutation.isPending ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {/* Phone Numbers List */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#10b981]" />
              </div>
              <h2 className="text-lg font-semibold text-white">Phone Numbers</h2>
            </div>
            <button
              onClick={addPhone}
              className="flex items-center gap-2 px-4 py-2 bg-[#2a3a4d] text-white rounded-lg hover:bg-[#3a4a5d] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Number</span>
            </button>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          {phones.map((phone, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-[#0f1419] rounded-xl">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1">Label</label>
                  <input
                    type="text"
                    value={phone.label || ""}
                    onChange={(e) => updatePhone(index, "label", e.target.value)}
                    placeholder="e.g., Main Office"
                    className="w-full px-4 py-2.5 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone.value}
                    onChange={(e) => updatePhone(index, "value", e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full px-4 py-2.5 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
                  />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={phone.isActive}
                      onChange={(e) => updatePhone(index, "isActive", e.target.checked)}
                      className="w-5 h-5 rounded border-[#2a3a4d] bg-[#1a2332] text-[#10b981] focus:ring-[#10b981]"
                    />
                    <span className="text-sm text-[#9ca3af]">Active</span>
                  </label>
                </div>
              </div>
              {phones.length > 1 && (
                <button
                  onClick={() => removePhone(index)}
                  className="p-2 text-[#ef4444] hover:bg-[#ef4444]/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
        <div className="space-y-2">
          {phones.filter(p => p.isActive && p.value).map((phone, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-[#0f1419] rounded-lg">
              <CheckCircle className="w-5 h-5 text-[#10b981]" />
              <span className="text-[#9ca3af]">{phone.label || "Phone"}:</span>
              <span className="text-white font-medium">{phone.value}</span>
            </div>
          ))}
          {phones.filter(p => p.isActive && p.value).length === 0 && (
            <p className="text-[#6b7280] text-center py-4">No active phone numbers to display</p>
          )}
        </div>
      </div>
    </div>
  );
}
