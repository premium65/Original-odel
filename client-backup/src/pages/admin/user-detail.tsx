import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Ban, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { useState } from "react";

export default function AdminUserDetail() {
  const [, params] = useRoute("/admin/users/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState("");
  const userId = parseInt(params?.id || "0");

  const { data: user, isLoading } = useQuery<User>({
    queryKey: [`/api/admin/users/${userId}`],
    enabled: userId > 0
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => apiRequest("POST", `/api/admin/users/${userId}/status`, { status }),
    onSuccess: () => {
      toast({ title: "Status Updated", description: "User status has been updated." });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const depositMutation = useMutation({
    mutationFn: async (amount: string) => {
      const response = await fetch(`/api/admin/users/${userId}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount })
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Deposit Added", description: "Deposit has been added to the user's account." });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] });
      setDepositAmount("");
    },
  });

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "active": return "default";
      case "pending": return "secondary";
      case "frozen": return "destructive";
      default: return "secondary";
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading user details...</div>;
  if (!user) return (
    <div className="text-center py-8">
      <p className="text-muted-foreground mb-4">User not found</p>
      <Button onClick={() => setLocation("/admin/users")}>Go Back</Button>
    </div>
  );

  return (
    <div>
      <Button variant="ghost" onClick={() => setLocation("/admin/users")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />Back to Users
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Complete user details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-lg">{user.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Username</p>
              <p className="text-lg">@{user.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Registered</p>
              <p className="text-lg">{new Date(user.registeredAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Manage user status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Current Status</p>
              <Badge variant={getStatusVariant(user.status)} className="text-base px-4 py-2">{user.status}</Badge>
            </div>
            <div className="space-y-2 pt-4">
              {user.status !== "active" && (
                <Button className="w-full" onClick={() => updateStatusMutation.mutate("active")}>
                  <Check className="h-4 w-4 mr-2" />Approve Account
                </Button>
              )}
              {user.status !== "frozen" && (
                <Button variant="destructive" className="w-full" onClick={() => updateStatusMutation.mutate("frozen")}>
                  <Ban className="h-4 w-4 mr-2" />Freeze Account
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Destination Amount</p>
              <p className="text-2xl font-bold text-amber-500">
                ₹ {parseFloat(user.destinationAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Milestone Amount</p>
              <p className="text-2xl font-bold text-green-500">
                ₹ {parseFloat(user.milestoneAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Milestone Reward</p>
              <p className="text-2xl font-bold text-blue-500">
                ₹ {parseFloat(user.milestoneReward).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Deposit</CardTitle>
            <CardDescription>Add funds to user's Milestone Amount</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Deposit Amount (LKR)</Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="Enter amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <Button
              onClick={() => depositMutation.mutate(depositAmount)}
              disabled={depositMutation.isPending || !depositAmount}
              className="w-full"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              {depositMutation.isPending ? "Adding..." : "Add Deposit"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
