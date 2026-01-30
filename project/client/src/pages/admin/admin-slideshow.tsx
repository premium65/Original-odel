import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Image, Plus, Trash2, Edit, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SlideshowItem {
  id: string;
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // FIXED: Correct API endpoint
  const { data: items = [], isLoading } = useQuery<SlideshowItem[]>({
    queryKey: ["/api/admin/settings/slideshow"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings/slideshow", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/settings/slideshow", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/slideshow"] });
      queryClient.invalidateQueries({ queryKey: ["/api/slideshow"] });
      toast({ title: "Success", description: "Slide created successfully!" });
      setIsAddOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create slide", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/admin/settings/slideshow/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/slideshow"] });
      queryClient.invalidateQueries({ queryKey: ["/api/slideshow"] });
      toast({ title: "Success", description: "Slide updated successfully!" });
      setEditItem(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update slide", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/settings/slideshow/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/slideshow"] });
      queryClient.invalidateQueries({ queryKey: ["/api/slideshow"] });
      toast({ title: "Success", description: "Slide deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete slide", variant: "destructive" });
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
    setImagePreview(null);
  };

  const openEdit = (item: SlideshowItem) => {
    setEditItem(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      linkUrl: item.linkUrl || "",
      buttonText: item.buttonText || "",
      isActive: item.isActive !== false,
    });
    setImagePreview(item.imageUrl || null);
  };

  // Handle image upload - convert to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "Image must be less than 5MB", variant: "destructive" });
        return;
      }
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setForm({ ...form, imageUrl: base64 });
        setUploading(false);
      };
      reader.onerror = () => {
        toast({ title: "Error", description: "Failed to read image", variant: "destructive" });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setForm({ ...form, imageUrl: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Slide
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="bg-[#1a1a2e] border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Image className="h-16 w-16 text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No slides yet</p>
            <p className="text-gray-500 text-sm">Click "Add Slide" to create your first slide</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="bg-[#1a1a2e] border-gray-700 overflow-hidden">
              <div className="h-40 bg-gray-800 relative">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-12 w-12 text-gray-600" />
                  </div>
                )}
                <div
                  className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${
                    item.isActive ? "bg-green-500" : "bg-gray-500"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-white font-bold truncate">{item.title || "Untitled"}</h3>
                <p className="text-gray-400 text-sm truncate">
                  {item.description || "No description"}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(item)}
                    className="border-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddOpen || !!editItem}
        onOpenChange={() => {
          setIsAddOpen(false);
          setEditItem(null);
          resetForm();
        }}
      >
        <DialogContent className="bg-[#1a1a2e] border-gray-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Slide" : "Add New Slide"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-[#16213e] border-gray-600"
                placeholder="Slide title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-[#16213e] border-gray-600"
                placeholder="Optional description"
              />
            </div>

            {/* IMAGE UPLOAD SECTION */}
            <div className="space-y-2">
              <Label>Image *</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
                >
                  {uploading ? (
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400">Click to upload image</p>
                      <p className="text-gray-500 text-sm mt-1">PNG, JPG, GIF (max 5MB)</p>
                    </>
                  )}
                </div>
              )}

              <p className="text-gray-500 text-xs">Or enter image URL:</p>
              <Input
                value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl}
                onChange={(e) => {
                  setForm({ ...form, imageUrl: e.target.value });
                  if (e.target.value) setImagePreview(e.target.value);
                }}
                className="bg-[#16213e] border-gray-600"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label>Link URL</Label>
              <Input
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                className="bg-[#16213e] border-gray-600"
                placeholder="/rating or https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                value={form.buttonText}
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                className="bg-[#16213e] border-gray-600"
                placeholder="SHOP NOW"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditItem(null);
                resetForm();
              }}
              className="border-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!form.title) {
                  toast({ title: "Error", description: "Title is required", variant: "destructive" });
                  return;
                }
                if (!form.imageUrl) {
                  toast({ title: "Error", description: "Image is required", variant: "destructive" });
                  return;
                }
                if (editItem) {
                  updateMutation.mutate({ id: editItem.id, data: form });
                } else {
                  createMutation.mutate(form);
                }
              }}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
