import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import type { Ad } from "@shared/schema";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminAds() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  
  // Form state
  const [adCode, setAdCode] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("101.75");
  const [details, setDetails] = useState("");
  const [link, setLink] = useState("");

  const { data: ads = [], isLoading } = useQuery<Ad[]>({
    queryKey: ["/api/ads"],
  });

  const createAdMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/admin/ads", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      toast({
        title: "Ad Created",
        description: "The ad has been created successfully",
      });
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message,
      });
    },
  });

  const updateAdMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      toast({
        title: "Ad Updated",
        description: "The ad has been updated successfully",
      });
      resetForm();
      setIsEditDialogOpen(false);
      setSelectedAd(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    },
  });

  const deleteAdMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      toast({
        title: "Ad Deleted",
        description: "The ad has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message,
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!imageFile || !name || !price || !details || !link || !adCode) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields including image",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("adCode", adCode);
    formData.append("name", name);
    formData.append("price", price);
    formData.append("details", details);
    formData.append("link", link);

    createAdMutation.mutate(formData);
  };

  const handleEdit = (ad: Ad) => {
    setSelectedAd(ad);
    setAdCode(ad.adCode);
    setName(ad.adCode);
    setPrice(ad.price);
    setLink(ad.link);
    setDetails("");
    setImagePreview(ad.imageUrl || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedAd) return;

    if (!name || !price || !link || !adCode) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields",
      });
      return;
    }

    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);
    }
    formData.append("adCode", adCode);
    formData.append("name", name);
    formData.append("price", price);
    formData.append("details", details);
    formData.append("link", link);

    updateAdMutation.mutate({ id: selectedAd.id, formData });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this ad? This action cannot be undone.")) {
      deleteAdMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setAdCode("");
    setImageFile(null);
    setImagePreview("");
    setName("");
    setPrice("101.75");
    setDetails("");
    setLink("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading ads...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-card border rounded-lg p-4">
        <h1 className="text-xl font-bold" style={{ color: '#B8936B' }}>
          Ads List
        </h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">Hello, welcome to HolidayInn!</p>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-amber-600 hover:bg-amber-700"
            data-testid="button-add-ad"
          >
            <Plus className="h-4 w-4 mr-2" />
            ADD AD
          </Button>
        </div>
      </div>

      {/* Ads List */}
      <div className="space-y-4">
        {ads.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No ads created yet. Click "ADD AD" to create your first ad.</p>
            </CardContent>
          </Card>
        ) : (
          ads.map((ad) => (
            <Card key={ad.id} className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {ad.imageUrl ? (
                      <img
                        src={ad.imageUrl}
                        alt={ad.adCode}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Ad Info */}
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <div>
                      <p className="font-semibold text-sm mb-1">{ad.adCode}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        {ad.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{ad.link}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
                        {ad.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {ad.link}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                      onClick={() => handleEdit(ad)}
                      data-testid={`button-edit-${ad.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleDelete(ad.id)}
                      data-testid={`button-delete-${ad.id}`}
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

      {/* Add Ad Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Completely fill the form below!</DialogTitle>
            <DialogDescription>Add a new ad to the platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image">Choose Image (Main)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                data-testid="input-ad-image"
              />
              {imagePreview && (
                <div className="mt-2 w-full h-32 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="adCode">Ad Code</Label>
              <Input
                id="adCode"
                placeholder="e.g. AD-0001"
                value={adCode}
                onChange={(e) => setAdCode(e.target.value)}
                data-testid="input-ad-code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Fashion Product Ad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-ad-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (LKR)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="e.g. 101.75"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                data-testid="input-ad-price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Link (URL)</Label>
              <Input
                id="link"
                placeholder="e.g. https://example.com/product"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                data-testid="input-ad-link"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                placeholder="Ad Details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                data-testid="input-ad-details"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={createAdMutation.isPending}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              data-testid="button-submit-ad"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createAdMutation.isPending ? "Adding..." : "ADD AD"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Ad Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Ad</DialogTitle>
            <DialogDescription>Update the ad information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-image">Choose Image (Main)</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                data-testid="input-edit-ad-image"
              />
              {imagePreview && (
                <div className="mt-2 w-full h-32 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Leave empty to keep current image</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-adCode">Ad Code</Label>
              <Input
                id="edit-adCode"
                placeholder="e.g. AD-0001"
                value={adCode}
                onChange={(e) => setAdCode(e.target.value)}
                data-testid="input-edit-ad-code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g. Fashion Product Ad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-edit-ad-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (LKR)</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                placeholder="e.g. 101.75"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                data-testid="input-edit-ad-price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-link">Link (URL)</Label>
              <Input
                id="edit-link"
                placeholder="e.g. https://example.com/product"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                data-testid="input-edit-ad-link"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-details">Details</Label>
              <Textarea
                id="edit-details"
                placeholder="Ad Details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                data-testid="input-edit-ad-details"
              />
            </div>
            <Button
              onClick={handleUpdate}
              disabled={updateAdMutation.isPending}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              data-testid="button-update-ad"
            >
              <Edit className="h-4 w-4 mr-2" />
              {updateAdMutation.isPending ? "Updating..." : "UPDATE AD"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
