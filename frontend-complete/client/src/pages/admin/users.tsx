import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, Ban, Check, Eye, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import type { User } from "@shared/schema";

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchInterval: 3000, // Refresh every 3 seconds to show new registrations
  });

  const filteredUsers = users?.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: string }) => {
      return apiRequest("POST", `/api/admin/users/${userId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "User status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">All Users</h1>
        <p className="text-muted-foreground">Manage all registered users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all user accounts and their status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-users"
            className="max-w-md"
          />
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : !filteredUsers || filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "No users match your search." : "No users found."}
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                      <TableCell className="font-medium" data-testid={`text-fullname-${user.id}`}>
                        {user.fullName}
                      </TableCell>
                      <TableCell data-testid={`text-username-${user.id}`}>
                        @{user.username}
                      </TableCell>
                      <TableCell data-testid={`text-email-${user.id}`}>
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusVariant(user.status)}
                          className="gap-1"
                          data-testid={`badge-status-${user.id}`}
                        >
                          {getStatusIcon(user.status)}
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.registeredAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              data-testid={`button-view-${user.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          {user.status !== "active" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  userId: user.id,
                                  status: "active",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-approve-${user.id}`}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {user.status !== "frozen" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  userId: user.id,
                                  status: "frozen",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-freeze-${user.id}`}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Freeze
                            </Button>
                          )}
                          {user.status === "frozen" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  userId: user.id,
                                  status: "active",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-unfreeze-${user.id}`}
                            >
                              <Unlock className="h-4 w-4 mr-1" />
                              Unfreeze
                            </Button>
                          )}
                        </div>
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
