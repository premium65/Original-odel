import { AdminLayout } from "@/components/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Image, Plus, Pencil, Trash2, GripVertical, ArrowLeft } from "lucide-react";

interface Slide {
  id: number;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  buttonText: string | null;
  buttonLink: string | null;
  displayOrder: number | null;
  isActive: boolean | null;
}

export default function AdminSlides() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    buttonText: "",
    buttonLink: "",
    displayOrder: 0,
    isActive: true
  });

  const { data: slides, isLoading } = useQuery<Slide[]>({
    queryKey: ["/api/slides"]
  });

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "",
      buttonText: "",
      buttonLink: "",
      displayOrder: 0,
      isActive: true
    });
    setEditingSlide(null);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/slides", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slides"] });
      toast({ title: "Slide created successfully" });
      setIsOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", `/api/slides/${editingSlide?.id}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slides"] });
      toast({ title: "Slide updated successfully" });
      setIsOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/slides/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slides"] });
      toast({ title: "Slide deleted successfully" });
    }
  });

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      imageUrl: slide.imageUrl,
      buttonText: slide.buttonText || "",
      buttonLink: slide.buttonLink || "",
      displayOrder: slide.displayOrder || 0,
      isActive: slide.isActive ?? true
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (editingSlide) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  if (!(user as any)?.isAdmin) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  return (
    <AdminLayout>
      <Button 
        variant="ghost" 
        onClick={() => window.history.back()}
        className="text-zinc-400 hover:text-white mb-4"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center">
            <Image className="h-6 w-6 text-pink-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Slideshow Images</h1>
            <p className="text-muted-foreground">{slides?.length || 0} slides on homepage</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-slide">
              <Plus className="mr-2 h-4 w-4" />
              Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingSlide ? "Edit Slide" : "Add New Slide"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Image URL</Label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://example.com/slide.jpg"
                  data-testid="input-slide-image"
                />
              </div>
              <div>
                <Label>Title (optional)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Slide title"
                  data-testid="input-slide-title"
                />
              </div>
              <div>
                <Label>Subtitle (optional)</Label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  placeholder="Slide subtitle"
                  data-testid="input-slide-subtitle"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Button Text</Label>
                  <Input
                    value={formData.buttonText}
                    onChange={(e) => setFormData({...formData, buttonText: e.target.value})}
                    placeholder="Learn More"
                    data-testid="input-slide-button-text"
                  />
                </div>
                <div>
                  <Label>Button Link</Label>
                  <Input
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({...formData, buttonLink: e.target.value})}
                    placeholder="/signup"
                    data-testid="input-slide-button-link"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                    data-testid="input-slide-order"
                  />
                </div>
                <div className="flex items-center justify-between pt-6">
                  <Label>Active</Label>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                    data-testid="switch-slide-active"
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit-slide"
              >
                {editingSlide ? "Update Slide" : "Add Slide"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading...
            </CardContent>
          </Card>
        ) : !slides?.length ? (
          <Card className="col-span-full">
            <CardContent className="py-16 text-center text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No slides yet. Add your first slide!</p>
            </CardContent>
          </Card>
        ) : (
          slides.map((slide) => (
            <Card key={slide.id} className="overflow-hidden" data-testid={`card-slide-${slide.id}`}>
              <div className="relative aspect-video bg-muted">
                <img
                  src={slide.imageUrl}
                  alt={slide.title || "Slide"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge
                    variant={slide.isActive ? "default" : "secondary"}
                    className={slide.isActive ? "bg-green-500/90" : ""}
                  >
                    {slide.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className="bg-background/80">
                    <GripVertical className="h-3 w-3 mr-1" />
                    Order: {slide.displayOrder}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium">{slide.title || "Untitled Slide"}</h3>
                {slide.subtitle && (
                  <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
                )}
                <div className="flex items-center justify-between mt-4">
                  {slide.buttonText && (
                    <Badge variant="outline">{slide.buttonText}</Badge>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(slide)}
                      data-testid={`button-edit-slide-${slide.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(slide.id)}
                      data-testid={`button-delete-slide-${slide.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
