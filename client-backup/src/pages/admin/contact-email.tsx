import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Save, Plus, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactSetting {
  id?: number;
  type: string;
  value: string;
  label?: string;
  isActive: boolean;
}

export default function AdminContactEmail() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [emails, setEmails] = useState<ContactSetting[]>([
    { type: "email", value: "", label: "Support", isActive: true }
  ]);

  const { data: settings = [] } = useQuery<ContactSetting[]>({
    queryKey: ["/api/admin/settings/contact"],
  });

  useEffect(() => {
    const emailSettings = settings.filter(s => s.type === "email");
    if (emailSettings.length > 0) {
      setEmails(emailSettings);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: ContactSetting[]) => {
      const res = await fetch("/api/admin/settings/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "email", items: data }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/contact"] });
      toast({ title: "Success", description: "Email addresses saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save email addresses", variant: "destructive" });
    },
  });

  const addEmail = () => {
    setEmails([...emails, { type: "email", value: "", label: "", isActive: true }]);
  };

  const removeEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, field: string, value: string | boolean) => {
    const updated = [...emails];
    updated[index] = { ...updated[index], [field]: value };
    setEmails(updated);
  };

  const handleSave = () => {
    saveMutation.mutate(emails);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Email Addresses</h1>
          <p className="text-[#9ca3af] mt-1">Manage contact email addresses displayed on your site</p>
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

      {/* Email List */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
        <div className="p-5 border-b border-[#2a3a4d]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#0ea5e9]" />
              </div>
              <h2 className="text-lg font-semibold text-white">Email Addresses</h2>
            </div>
            <button
              onClick={addEmail}
              className="flex items-center gap-2 px-4 py-2 bg-[#2a3a4d] text-white rounded-lg hover:bg-[#3a4a5d] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Email</span>
            </button>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          {emails.map((email, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-[#0f1419] rounded-xl">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1">Label</label>
                  <input
                    type="text"
                    value={email.label || ""}
                    onChange={(e) => updateEmail(index, "label", e.target.value)}
                    placeholder="e.g., Support"
                    className="w-full px-4 py-2.5 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email.value}
                    onChange={(e) => updateEmail(index, "value", e.target.value)}
                    placeholder="support@example.com"
                    className="w-full px-4 py-2.5 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none"
                  />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={email.isActive}
                      onChange={(e) => updateEmail(index, "isActive", e.target.checked)}
                      className="w-5 h-5 rounded border-[#2a3a4d] bg-[#1a2332] text-[#10b981] focus:ring-[#10b981]"
                    />
                    <span className="text-sm text-[#9ca3af]">Active</span>
                  </label>
                </div>
              </div>
              {emails.length > 1 && (
                <button
                  onClick={() => removeEmail(index)}
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
          {emails.filter(e => e.isActive && e.value).map((email, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-[#0f1419] rounded-lg">
              <CheckCircle className="w-5 h-5 text-[#10b981]" />
              <span className="text-[#9ca3af]">{email.label || "Email"}:</span>
              <span className="text-white font-medium">{email.value}</span>
            </div>
          ))}
          {emails.filter(e => e.isActive && e.value).length === 0 && (
            <p className="text-[#6b7280] text-center py-4">No active email addresses to display</p>
          )}
        </div>
      </div>
    </div>
  );
}
