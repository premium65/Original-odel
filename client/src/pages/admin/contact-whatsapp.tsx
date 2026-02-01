import { useState, useEffect } from "react";
import { MessageCircle, Save, Plus, Trash2 } from "lucide-react";
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

export default function ContactWhatsApp() {
  const { toast } = useToast();
  const [numbers, setNumbers] = useState<Contact[]>([]);

  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/admin/settings/contacts/whatsapp"],
  });

  useEffect(() => {
    if (contacts) {
      setNumbers(contacts);
    }
  }, [contacts]);

  const saveMutation = useMutation({
    mutationFn: async (contact: Partial<Contact>) => {
      if (contact.id && contact.id > 0) {
        return apiRequest("PUT", `/api/admin/settings/contacts/${contact.id}`, {
          value: contact.value,
          label: contact.label,
          isActive: contact.isActive
        });
      } else {
        return apiRequest("POST", "/api/admin/settings/contacts", {
          type: "whatsapp",
          value: contact.value,
          label: contact.label
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/contacts/whatsapp"] });
      toast({ title: "Success", description: "WhatsApp contact saved!" });
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/contacts/whatsapp"] });
      toast({ title: "Deleted", description: "WhatsApp contact removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete contact", variant: "destructive" });
    }
  });

  const handleSave = async () => {
    for (const num of numbers) {
      await saveMutation.mutateAsync(num);
    }
  };

  const handleAdd = () => {
    setNumbers([...numbers, { id: -Date.now(), type: "whatsapp", label: "New", value: "", isActive: true }]);
  };

  const handleDelete = (id: number) => {
    if (id > 0) {
      deleteMutation.mutate(id);
    }
    setNumbers(numbers.filter(n => n.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25d366]"></div>
      </div>
    );
  }

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
          <h3 className="text-white font-semibold flex items-center gap-2"><MessageCircle className="h-5 w-5 text-[#25d366]" /> WhatsApp Numbers</h3>
          <button onClick={handleAdd} className="px-3 py-1.5 bg-[#25d366]/20 text-[#25d366] text-sm rounded-lg flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="p-6 space-y-4">
          {numbers.length === 0 ? (
            <p className="text-center text-[#6b7280] py-8">No WhatsApp numbers added yet. Click "Add" to create one.</p>
          ) : (
            numbers.map((num) => (
              <div key={num.id} className="flex items-center gap-4 p-4 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-[#25d366]/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-[#25d366]" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">Label</label>
                    <input
                      type="text"
                      value={num.label}
                      onChange={(e) => setNumbers(numbers.map(n => n.id === num.id ? {...n, label: e.target.value} : n))}
                      className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">WhatsApp Number (with country code)</label>
                    <input
                      type="text"
                      value={num.value}
                      onChange={(e) => setNumbers(numbers.map(n => n.id === num.id ? {...n, value: e.target.value} : n))}
                      className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none"
                      placeholder="+94XXXXXXXXX"
                    />
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={num.isActive}
                    onChange={(e) => setNumbers(numbers.map(n => n.id === num.id ? {...n, isActive: e.target.checked} : n))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
                <button
                  onClick={() => handleDelete(num.id)}
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
