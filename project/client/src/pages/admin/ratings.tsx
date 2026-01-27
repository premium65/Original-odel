import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Rating } from "@shared/schema";

export default function AdminRatings() {
  const { toast } = useToast();
  const { data: ratings, isLoading } = useQuery<Rating[]>({
    queryKey: ["/api/admin/ratings"],
  });

  const deleteRatingMutation = useMutation({
    mutationFn: async (ratingId: number) => {
      return apiRequest("DELETE", `/api/admin/ratings/${ratingId}`, {});
    },
    onSuccess: () => {
      toast({ title: "Rating Deleted", description: "The rating has been removed successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ratings"] });
    },
    onError: (error: Error) => {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Ratings Management</h1>
        <p className="text-muted-foreground">Moderate and manage all user ratings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Ratings</CardTitle>
          <CardDescription>View and manage ratings submitted by users</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading ratings...</p>
          ) : !ratings || ratings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ratings found.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rater</TableHead>
                    <TableHead>Target User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ratings.map((rating) => (
                    <TableRow key={rating.id}>
                      <TableCell>User #{rating.userId}</TableCell>
                      <TableCell>@{rating.targetUsername}</TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          {Array.from({ length: rating.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{rating.comment || <span className="text-muted-foreground">No comment</span>}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(rating.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => deleteRatingMutation.mutate(rating.id)} disabled={deleteRatingMutation.isPending}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}