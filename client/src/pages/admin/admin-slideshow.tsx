import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Image, Plus, Trash2, Edit, Save, X, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SlideshowItem {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  buttonText: string | null;
  order: number;
  isActive: boolean;
}

export default function AdminSlideshow() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<SlideshowItem | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    buttonText: "",
    isActive: true,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<SlideshowItem[]>({
    queryKey: ["/api/admin/slideshow"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/slideshow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slideshow"] });
      toast({ title: "Success", description: "Slideshow item created" });
      setIsAddOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/admin/slideshow/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slideshow"] });
      toast({ title: "Success", description: "Slideshow item updated" });
      setEditItem(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/slideshow/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slideshow"] });
      toast({ title: "Success", description: "Slideshow item deleted" });
    },
  });

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      buttonText: "",
      isActive: true,
    });
  };

  const openEdit = (item: SlideshowItem) => {
    setEditItem(item);
    setForm({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl || "",
      buttonText: item.buttonText || "",
      isActive: item.isActive,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
            <Image className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Slideshow Images</h1>
            <p className="text-gray-400">Manage homepage slideshow</p>
          </div>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-gradient-to-r from-purple-500 to-pink-600">
          <Plus className="h-4 w-4 mr-2" /> Add Slide
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="bg-[#1a1a2e] border-gray-700 overflow-hidden">
            <div className="h-40 bg-gray-800 relative">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="h-12 w-12 text-gray-600" />
                </div>
              )}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${item.isActive ? 'bg-green-500' : 'bg-gray-500'}`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="text-white font-bold truncate">{item.title}</h3>
              <p className="text-gray-400 text-sm truncate">{item.description || 'No description'}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => openEdit(item)} className="border-gray-600">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(item.id)} className="border-red-600 text-red-400 hover:bg-red-600/20">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || !!editItem} onOpenChange={() => { setIsAddOpen(false); setEditItem(null); resetForm(); }}>
        <DialogContent className="bg-[#1a1a2e] border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Slide" : "Add New Slide"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-[#16213e] border-gray-600" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-[#16213e] border-gray-600" />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="bg-[#16213e] border-gray-600" />
            </div>
            <div className="space-y-2">
              <Label>Link URL</Label>
              <Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} className="bg-[#16213e] border-gray-600" />
            </div>
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} className="bg-[#16213e] border-gray-600" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddOpen(false); setEditItem(null); }} className="border-gray-600">Cancel</Button>
            <Button
              onClick={() => {
                if (editItem) {
                  updateMutation.mutate({ id: editItem.id, data: form });
                } else {
                  createMutation.mutate(form);
                }
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              {editItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
