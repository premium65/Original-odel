import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Image, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Slide {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminSlideshow() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    buttonText: "",
    isActive: true,
  });

  const { data: slides = [], isLoading } = useQuery<Slide[]>({
    queryKey: ["/api/admin/settings/slideshow"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/admin/settings/slideshow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create slide");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/slideshow"] });
      toast({ title: "Success", description: "Slide created successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create slide", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/settings/slideshow/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/slideshow"] });
      toast({ title: "Success", description: "Slide deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete slide", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      buttonText: "",
      isActive: true,
    });
    setImagePreview(null);
    setIsDialogOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "Image must be less than 5MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData({ ...formData, imageUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.imageUrl) {
      toast({ title: "Error", description: "Title and Image are required", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Image className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Slideshow Images</h1>
            <p className="text-gray-400">Manage homepage slideshow images</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
        </Button>
      </div>

      {/* Slides Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : slides.length === 0 ? (
        <div className="text-center py-12 bg-[#1a2332] rounded-xl border border-[#2a3a4d]">
          <Image className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No slides yet</p>
          <p className="text-gray-500 text-sm">Click "Add Slide" to create your first slideshow image</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide) => (
            <div key={slide.id} className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
              {/* Image Preview */}
              <div className="relative h-40 bg-[#0f1419]">
                {slide.imageUrl ? (
                  <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-12 w-12 text-gray-600" />
                  </div>
                )}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                  slide.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                }`}>
                  {slide.isActive ? "Active" : "Inactive"}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-white truncate">{slide.title}</h3>
                <p className="text-sm text-gray-400 truncate mt-1">{slide.description || "No description"}</p>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => deleteMutation.mutate(slide.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1a2332] border-[#2a3a4d] text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Slide</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Image *</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#2a3a4d] rounded-xl p-4 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
              >
                {imagePreview || formData.imageUrl ? (
                  <div className="relative">
                    <img src={imagePreview || formData.imageUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview(null);
                        setFormData({ ...formData, imageUrl: "" });
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Click to upload image</p>
                    <p className="text-gray-500 text-xs mt-1">PNG, JPG, WEBP (max 5MB)</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>

            {/* Or URL */}
            <div className="text-center text-gray-500 text-sm">— or paste URL —</div>
            <Input
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl.startsWith("data:") ? "" : formData.imageUrl}
              onChange={(e) => { setFormData({ ...formData, imageUrl: e.target.value }); setImagePreview(null); }}
              className="bg-[#0f1419] border-[#2a3a4d]"
            />

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <Input
                placeholder="Slide title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-[#0f1419] border-[#2a3a4d]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <Input
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#0f1419] border-[#2a3a4d]"
              />
            </div>

            {/* Link URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Link URL</label>
              <Input
                placeholder="https://..."
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="bg-[#0f1419] border-[#2a3a4d]"
              />
            </div>

            {/* Button Text */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Button Text</label>
              <Input
                placeholder="Learn More"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                className="bg-[#0f1419] border-[#2a3a4d]"
              />
            </div>

            {/* Active */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Active</label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm} className="border-[#2a3a4d]">Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
