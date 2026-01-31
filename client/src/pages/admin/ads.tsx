import { AdminLayout } from "@/components/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { useAds } from "@/hooks/use-ads";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Plus, Pencil, Trash2, ExternalLink, ArrowLeft } from "lucide-react";

export default function AdminAds() {
  const { user } = useAuth();
  const { data: ads, isLoading } = useAds();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    targetUrl: "",
    price: "",
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      targetUrl: "",
      price: "",
      isActive: true
    });
    setEditingAd(null);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/ads", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      toast({ title: "Ad created successfully" });
      setIsOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", `/api/ads/${editingAd.id}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      toast({ title: "Ad updated successfully" });
      setIsOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/ads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      toast({ title: "Ad deleted successfully" });
    }
  });

  const handleEdit = (ad: any) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl,
      targetUrl: ad.targetUrl,
      price: ad.price,
      isActive: ad.isActive
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (editingAd) {
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
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <Megaphone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Manage Ads</h1>
            <p className="text-muted-foreground">{ads?.length || 0} total ads</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-ad">
              <Plus className="mr-2 h-4 w-4" />
              Create Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingAd ? "Edit Ad" : "Create New Ad"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ad title"
                  data-testid="input-ad-title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Short description"
                  data-testid="input-ad-description"
                />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-ad-image"
                />
              </div>
              <div>
                <Label>Target URL</Label>
                <Input
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
                  placeholder="https://example.com"
                  data-testid="input-ad-target"
                />
              </div>
              <div>
                <Label>Price per Click (LKR)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.50"
                  data-testid="input-ad-price"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  data-testid="switch-ad-active"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit-ad"
              >
                {editingAd ? "Update Ad" : "Create Ad"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : !ads?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No ads yet. Create your first ad!
                  </TableCell>
                </TableRow>
              ) : (
                ads.map((ad) => (
                  <TableRow key={ad.id} data-testid={`row-ad-${ad.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{ad.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {ad.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-primary/20 text-primary">
                        LKR {parseFloat(ad.price).toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={ad.isActive ? "default" : "secondary"}
                        className={ad.isActive ? "bg-green-500/20 text-green-500" : ""}
                      >
                        {ad.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ad.createdAt ? new Date(ad.createdAt).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => window.open(ad.targetUrl, "_blank")}
                          data-testid={`button-view-ad-${ad.id}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(ad)}
                          data-testid={`button-edit-ad-${ad.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(ad.id)}
                          data-testid={`button-delete-ad-${ad.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
