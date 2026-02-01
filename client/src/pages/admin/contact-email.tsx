import { useState, useEffect } from "react";
import { Mail, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ContactItem {
  id: number;
  type: string;
  value: string;
  label: string;
  isActive: boolean;
}

export default function ContactEmail() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [emails, setEmails] = useState<ContactItem[]>([]);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: api.getContacts,
  });

  useEffect(() => {
    if (contacts) {
      const emailContacts = contacts.filter((c: ContactItem) => c.type === "email");
      if (emailContacts.length > 0) {
        setEmails(emailContacts);
      }
    }
  }, [contacts]);

  const createMutation = useMutation({
    mutationFn: (data: { type: string; value: string; label: string }) => api.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast({ title: "Email added!" });
    },
    onError: () => {
      toast({ title: "Failed to add email", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast({ title: "Email updated!" });
    },
    onError: () => {
      toast({ title: "Failed to update email", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast({ title: "Email deleted!" });
    },
    onError: () => {
      toast({ title: "Failed to delete email", variant: "destructive" });
    },
  });

  const handleSave = async () => {
    for (const email of emails) {
      if (email.id < 0) {
        await createMutation.mutateAsync({ type: "email", value: email.value, label: email.label });
      } else {
        await updateMutation.mutateAsync({ id: email.id, data: { value: email.value, label: email.label, isActive: email.isActive } });
      }
    }
    toast({ title: "Email settings saved!" });
  };

  const handleAdd = () => {
    setEmails([...emails, { id: -Date.now(), type: "email", value: "", label: "New", isActive: true }]);
  };

  const handleDelete = async (email: ContactItem) => {
    if (email.id > 0) {
      await deleteMutation.mutateAsync(email.id);
    }
    setEmails(emails.filter(e => e.id !== email.id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

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
          disabled={isSaving}
          className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save
        </button>
      </div>

      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold flex items-center gap-2"><Mail className="h-5 w-5 text-[#3b82f6]" /> Email Addresses</h3>
          <button onClick={handleAdd} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="p-6 space-y-4">
          {emails.length === 0 ? (
            <div className="text-center py-8 text-[#6b7280]">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No email addresses added yet. Click "Add" to add an email address.</p>
            </div>
          ) : (
            emails.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-[#3b82f6]" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">Label</label>
                    <input type="text" value={item.label} onChange={(e) => setEmails(emails.map(p => p.id === item.id ? {...p, label: e.target.value} : p))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">Email Address</label>
                    <input type="email" value={item.value} onChange={(e) => setEmails(emails.map(p => p.id === item.id ? {...p, value: e.target.value} : p))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" placeholder="email@example.com" />
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={item.isActive} onChange={(e) => setEmails(emails.map(p => p.id === item.id ? {...p, isActive: e.target.checked} : p))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
                <button
                  onClick={() => handleDelete(item)}
                  disabled={deleteMutation.isPending}
                  className="w-10 h-10 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30 disabled:opacity-50"
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
