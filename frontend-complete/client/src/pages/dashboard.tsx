import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, LogOut, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRatingSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import type { User, Rating } from "@shared/schema";
import dashboardBg from "@assets/dashboard-bg.png";
import { ImageSlideshow } from "@/components/image-slideshow";

const ratingFormSchema = insertRatingSchema.extend({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type RatingForm = z.infer<typeof ratingFormSchema>;

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedRating, setSelectedRating] = useState(0);

  const { data: currentUser, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: myRatings, isLoading: ratingsLoading } = useQuery<Rating[]>({
    queryKey: ["/api/ratings/my"],
  });

  const form = useForm<RatingForm>({
    resolver: zodResolver(ratingFormSchema),
    defaultValues: {
      targetUsername: "",
      rating: 0,
      comment: "",
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async (data: RatingForm) => {
      return apiRequest("POST", "/api/ratings", data);
    },
    onSuccess: () => {
      toast({
        title: "Rating Submitted!",
        description: "Your rating has been saved successfully.",
      });
      form.reset();
      setSelectedRating(0);
      queryClient.invalidateQueries({ queryKey: ["/api/ratings/my"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast({ title: "Logged out successfully" });
    setLocation("/");
  };

  const onSubmit = (data: RatingForm) => {
    ratingMutation.mutate({ ...data, rating: selectedRating });
  };

  if (userLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    setLocation("/login");
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "frozen":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "frozen":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background relative" style={{ backgroundImage: `url(${dashboardBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/50 pointer-events-none z-0" />
      {/* Navigation */}
      <nav className="border-b bg-black/85 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-500" />
              <span className="text-xl font-bold text-white">Rating - Ads</span>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex gap-6">
                <a href="/dashboard" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-home">HOME</a>
                <a href="#" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-rooms">ROOMS</a>
                <a href="#" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-event">EVENT SPACE</a>
                <a href="/features" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-features">FEATURES</a>
                <a href="/rating" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-rating">ADS</a>
                <a href="/withdraw" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-withdraw">WITHDRAW</a>
                <a href="/points" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-point">POINT</a>
                <a href="#" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-contact">CONTACT US</a>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="text-amber-500 hover:text-amber-400" data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Account Status Banner */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>Welcome, {currentUser.fullName}</CardTitle>
                <CardDescription>@{currentUser.username}</CardDescription>
              </div>
              <Badge variant={getStatusVariant(currentUser.status)} className="gap-1" data-testid={`badge-status-${currentUser.status}`}>
                {getStatusIcon(currentUser.status)}
                {currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          {currentUser.status === "pending" && (
            <CardContent>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Your account is pending admin approval. You'll be able to submit ratings once your account is activated.
                </p>
              </div>
            </CardContent>
          )}
          {currentUser.status === "frozen" && (
            <CardContent>
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-md">
                <p className="text-sm text-destructive">
                  Your account has been frozen. Please contact support for more information.
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Image Slideshow */}
        <ImageSlideshow />

        <div className="grid lg:grid-cols-1 gap-6 mt-6">
          {/* My Ratings */}
          <Card>
            <CardHeader>
              <CardTitle>My Ratings</CardTitle>
              <CardDescription>
                Ratings you've submitted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ratingsLoading ? (
                <p className="text-sm text-muted-foreground">Loading ratings...</p>
              ) : !myRatings || myRatings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">You haven't submitted any ratings yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRatings.map((rating) => (
                    <div
                      key={rating.id}
                      className="p-4 border rounded-md"
                      data-testid={`rating-${rating.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium" data-testid={`text-rated-user-${rating.id}`}>
                          @{rating.targetUsername}
                        </span>
                        <div className="flex">
                          {Array.from({ length: rating.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                      </div>
                      {rating.comment && (
                        <p className="text-sm text-muted-foreground">{rating.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
