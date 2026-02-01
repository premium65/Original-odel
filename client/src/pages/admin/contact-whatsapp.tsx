import { useState, useEffect } from "react";
import { MessageCircle, Save, Plus, Trash2, Loader2 } from "lucide-react";
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

export default function ContactWhatsApp() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [numbers, setNumbers] = useState<ContactItem[]>([]);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: api.getContacts,
  });

  useEffect(() => {
    if (contacts) {
      const whatsappContacts = contacts.filter((c: ContactItem) => c.type === "whatsapp");
      if (whatsappContacts.length > 0) {
        setNumbers(whatsappContacts);
      }
    }
  }, [contacts]);

  const createMutation = useMutation({
    mutationFn: (data: { type: string; value: string; label: string }) => api.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast({ title: "WhatsApp number added!" });
    },
    onError: () => {
      toast({ title: "Failed to add WhatsApp number", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast({ title: "WhatsApp number updated!" });
    },
    onError: () => {
      toast({ title: "Failed to update WhatsApp number", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast({ title: "WhatsApp number deleted!" });
    },
    onError: () => {
      toast({ title: "Failed to delete WhatsApp number", variant: "destructive" });
    },
  });

  const handleSave = async () => {
    for (const num of numbers) {
      if (num.id < 0) {
        await createMutation.mutateAsync({ type: "whatsapp", value: num.value, label: num.label });
      } else {
        await updateMutation.mutateAsync({ id: num.id, data: { value: num.value, label: num.label, isActive: num.isActive } });
      }
    }
    toast({ title: "WhatsApp settings saved!" });
  };

  const handleAdd = () => {
    setNumbers([...numbers, { id: -Date.now(), type: "whatsapp", value: "", label: "New", isActive: true }]);
  };

  const handleDelete = async (num: ContactItem) => {
    if (num.id > 0) {
      await deleteMutation.mutateAsync(num.id);
    }
    setNumbers(numbers.filter(n => n.id !== num.id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#25d366]" />
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

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
          disabled={isSaving}
          className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save
        </button>
      </div>

      <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
          <h3 className="text-white font-semibold flex items-center gap-2"><MessageCircle className="h-5 w-5 text-[#25d366]" /> WhatsApp Numbers</h3>
          <button onClick={handleAdd} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="p-6 space-y-4">
          {numbers.length === 0 ? (
            <div className="text-center py-8 text-[#6b7280]">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No WhatsApp numbers added yet. Click "Add" to add a WhatsApp number.</p>
            </div>
          ) : (
            numbers.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-[#25d366]/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-[#25d366]" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">Label</label>
                    <input type="text" value={item.label} onChange={(e) => setNumbers(numbers.map(p => p.id === item.id ? {...p, label: e.target.value} : p))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6b7280] mb-1">WhatsApp Number (with country code)</label>
                    <input type="text" value={item.value} onChange={(e) => setNumbers(numbers.map(p => p.id === item.id ? {...p, value: e.target.value} : p))} className="w-full px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" placeholder="+94XXXXXXXXX" />
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={item.isActive} onChange={(e) => setNumbers(numbers.map(p => p.id === item.id ? {...p, isActive: e.target.checked} : p))} className="sr-only peer" />
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
