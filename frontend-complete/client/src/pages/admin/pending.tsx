import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function AdminPending() {
  const { toast } = useToast();
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    select: (data) => data.filter((user) => user.status === "pending"),
    refetchInterval: 2000, // Auto-refresh every 2 seconds to show new pending users
    refetchIntervalInBackground: true,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: string }) => {
      return apiRequest("POST", `/api/admin/users/${userId}/status`, { status });
    },
    onSuccess: (_, variables) => {
      const action = variables.status === "active" ? "approved" : "rejected";
      toast({
        title: `User ${action}`,
        description: `The user has been ${action} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pending Approvals</h1>
        <p className="text-muted-foreground">Review and approve new user registrations</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading pending users...</p>
          </CardContent>
        </Card>
      ) : !users || users.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending approvals</p>
              <p className="text-sm text-muted-foreground mt-2">
                All user registrations have been processed
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {users.map((user) => (
            <Card key={user.id} data-testid={`pending-card-${user.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl" data-testid={`text-fullname-${user.id}`}>
                      {user.fullName}
                    </CardTitle>
                    <CardDescription data-testid={`text-username-${user.id}`}>
                      @{user.username}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm" data-testid={`text-email-${user.id}`}>
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Registered</p>
                    <p className="text-sm">
                      {new Date(user.registeredAt).toLocaleDateString()} at{" "}
                      {new Date(user.registeredAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        userId: user.id,
                        status: "active",
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                    data-testid={`button-approve-${user.id}`}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        userId: user.id,
                        status: "frozen",
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                    data-testid={`button-reject-${user.id}`}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
