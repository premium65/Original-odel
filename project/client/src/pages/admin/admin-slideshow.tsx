import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Image, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

interface SlideshowItem {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  buttonText: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SlideshowFormData {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  order: number;
  isActive: boolean;
}

const defaultFormData: SlideshowFormData = {
  title: "",
  description: "",
  imageUrl: "",
  linkUrl: "",
  buttonText: "SHOP NOW",
  order: 0,
  isActive: true,
};

export default function AdminSlideshow() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SlideshowItem | null>(null);
  const [formData, setFormData] = useState<SlideshowFormData>(defaultFormData);

  // Fetch slideshow items
  const { data: slideshowItems, isLoading } = useQuery<SlideshowItem[]>({
    queryKey: ["/api/admin/slideshow"],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: SlideshowFormData) => {
      return apiRequest("POST", "/api/admin/slideshow", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Slideshow item created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slideshow"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SlideshowFormData }) => {
      return apiRequest("PUT", `/api/admin/slideshow/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Slideshow item updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slideshow"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/slideshow/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Slideshow item deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slideshow"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest("PUT", `/api/admin/slideshow/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slideshow"] });
    },
  });

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingItem(null);
  };

  const handleEdit = (item: SlideshowItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl || "",
      buttonText: item.buttonText || "SHOP NOW",
      order: item.order,
      isActive: item.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleActive = (item: SlideshowItem) => {
    toggleActiveMutation.mutate({ id: item.id, isActive: !item.isActive });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Slideshow Manager</h1>
              <p className="text-gray-400">Manage dashboard slideshow images</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Slide
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Slide" : "Add New Slide"}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingItem ? "Update slideshow item details" : "Add a new image to the slideshow"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Summer Sale"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Up to 70% off on everything"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="imageUrl">Image URL *</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="bg-gray-700 border-gray-600"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden h-32 bg-gray-700">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x200?text=Invalid+Image+URL";
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      placeholder="SHOP NOW"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="linkUrl">Link URL</Label>
                    <Input
                      id="linkUrl"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      placeholder="/products"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.title || !formData.imageUrl || createMutation.isPending || updateMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  {editingItem ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Slideshow Items Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : !slideshowItems || slideshowItems.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Image className="h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Slides Yet</h3>
              <p className="text-gray-400 mb-4">Add your first slideshow image to get started</p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-amber-500 hover:bg-amber-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Slide
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slideshowItems
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <Card
                  key={item.id}
                  className={`bg-gray-800 border-gray-700 overflow-hidden ${
                    !item.isActive ? "opacity-60" : ""
                  }`}
                >
                  <div className="relative h-48">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                      }}
                    />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Badge variant="secondary" className="bg-black/50">
                        #{item.order}
                      </Badge>
                      {item.isActive ? (
                        <Badge className="bg-green-500/80">Active</Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-red-500/80">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{item.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {item.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(item)}
                        className="text-gray-400 hover:text-white"
                      >
                        {item.isActive ? (
                          <><EyeOff className="h-4 w-4 mr-1" /> Hide</>
                        ) : (
                          <><Eye className="h-4 w-4 mr-1" /> Show</>
                        )}
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-800 border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Slide?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                This will permanently delete "{item.title}" from the slideshow.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(item.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Preview Section */}
        {slideshowItems && slideshowItems.length > 0 && (
          <Card className="bg-gray-800 border-gray-700 mt-8">
            <CardHeader>
              <CardTitle>Slideshow Preview</CardTitle>
              <CardDescription>How the slideshow will appear on the dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img
                  src={slideshowItems.filter(i => i.isActive).sort((a, b) => a.order - b.order)[0]?.imageUrl || ""}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold">
                    {slideshowItems.filter(i => i.isActive)[0]?.title || "No active slides"}
                  </h3>
                  <p className="text-white/80">
                    {slideshowItems.filter(i => i.isActive)[0]?.description || ""}
                  </p>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {slideshowItems
                    .filter(i => i.isActive)
                    .sort((a, b) => a.order - b.order)
                    .map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${index === 0 ? "bg-amber-500 w-6" : "bg-white/50"}`}
                      />
                    ))}
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-2 text-center">
                {slideshowItems.filter(i => i.isActive).length} active slide(s)
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
