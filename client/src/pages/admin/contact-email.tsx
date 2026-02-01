import { useState, useEffect } from "react";
import { Mail, Save, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: number;
  type: string;
  value: string;
  label: string;
  isActive: boolean;
}

export default function ContactEmail() {
  const { toast } = useToast();
  const [emails, setEmails] = useState<Contact[]>([]);

  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/admin/settings/contacts/email"],
  });

  useEffect(() => {
    if (contacts) {
      setEmails(contacts);
    }
  }, [contacts]);

  const saveMutation = useMutation({
    mutationFn: async (email: Partial<Contact>) => {
      if (email.id && email.id > 0) {
        return apiRequest("PUT", `/api/admin/settings/contacts/${email.id}`, {
          value: email.value,
          label: email.label,
          isActive: email.isActive
        });
      } else {
        return apiRequest("POST", "/api/admin/settings/contacts", {
          type: "email",
          value: email.value,
          label: email.label
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/contacts/email"] });
      toast({ title: "Success", description: "Email contact saved!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save contact", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/settings/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/contacts/email"] });
      toast({ title: "Deleted", description: "Email contact removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete contact", variant: "destructive" });
    }
  });

  const handleSave = async () => {
    for (const email of emails) {
      await saveMutation.mutateAsync(email);
    }
  };

  const handleAdd = () => {
    setEmails([...emails, { id: -Date.now(), type: "email", label: "New", value: "", isActive: true }]);
  };

  const handleDelete = (id: number) => {
    if (id > 0) {
      deleteMutation.mutate(id);
    }
    setEmails(emails.filter(e => e.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b82f6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Email Addresses</h1>
            <p className="text-[#9ca3af]">Manage contact email addresses</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-5 w-5" /> {saveMutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold flex items-center gap-2"><Mail className="h-5 w-5 text-[#3b82f6]" /> Email Addresses</h3>
          <button onClick={handleAdd} className="px-3 py-1.5 bg-[#3b82f6]/20 text-[#3b82f6] text-sm rounded-lg flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="p-6 space-y-4">
          {emails.length === 0 ? (
            <p className="text-center text-[#6b7280] py-8">No email addresses added yet. Click "Add" to create one.</p>
          ) : (
            emails.map((email) => (
              <div key={email.id} className="flex items-center gap-4 p-4 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-[#3b82f6]" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">Label</label>
                    <input
                      type="text"
                      value={email.label}
                      onChange={(e) => setEmails(emails.map(em => em.id === email.id ? {...em, label: e.target.value} : em))}
                      className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email.value}
                      onChange={(e) => setEmails(emails.map(em => em.id === email.id ? {...em, value: e.target.value} : em))}
                      className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none"
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={email.isActive}
                    onChange={(e) => setEmails(emails.map(em => em.id === email.id ? {...em, isActive: e.target.checked} : em))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
                <button
                  onClick={() => handleDelete(email.id)}
                  className="w-10 h-10 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
