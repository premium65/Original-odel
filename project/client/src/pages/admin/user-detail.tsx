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
    enabled: userId > 0,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("POST", `/api/admin/users/${userId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "User status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] });
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

  const depositMutation = useMutation({
    mutationFn: async (amount: string) => {
      const response = await fetch(`/api/admin/users/${userId}/deposit`, {
        method: "POST",
        body: JSON.stringify({ amount }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deposit Added",
        description: "The deposit has been added to the user's account successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] });
      setDepositAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Deposit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
      });
      return;
    }
    depositMutation.mutate(depositAmount);
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

  if (isLoading) {
    return <div className="text-center py-8">Loading user details...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">User not found</p>
        <Button onClick={() => setLocation("/admin/users")}>Go Back</Button>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => setLocation("/admin/users")}
        className="mb-6"
        data-testid="button-back"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Users
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
              <p className="text-lg" data-testid="text-fullname">
                {user.fullName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Username</p>
              <p className="text-lg" data-testid="text-username">
                @{user.username}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg" data-testid="text-email">
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Registered Date</p>
              <p className="text-lg">
                {new Date(user.registeredAt).toLocaleDateString()}{" "}
                {new Date(user.registeredAt).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Account Type</p>
              <p className="text-lg">
                {user.isAdmin === 1 ? "Administrator" : "Regular User"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Manage user account status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Current Status</p>
              <Badge
                variant={getStatusVariant(user.status)}
                className="text-base px-4 py-2"
                data-testid="badge-status"
              >
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </Badge>
            </div>

            <div className="space-y-2 pt-4">
              <p className="text-sm font-medium text-muted-foreground">Quick Actions</p>
              <div className="flex flex-col gap-2">
                {user.status !== "active" && (
                  <Button
                    className="w-full"
                    onClick={() => updateStatusMutation.mutate("active")}
                    disabled={updateStatusMutation.isPending}
                    data-testid="button-approve"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Account
                  </Button>
                )}
                {user.status !== "frozen" && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => updateStatusMutation.mutate("frozen")}
                    disabled={updateStatusMutation.isPending}
                    data-testid="button-freeze"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Freeze Account
                  </Button>
                )}
                {user.status === "frozen" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => updateStatusMutation.mutate("active")}
                    disabled={updateStatusMutation.isPending}
                    data-testid="button-unfreeze"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Unfreeze Account
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Information */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
            <CardDescription>User's balance and transaction details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Destination Amount</p>
              <p className="text-2xl font-bold text-amber-500" data-testid="text-destination-amount">
                ₹ {parseFloat(user.destinationAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">Registration bonus</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Milestone Amount</p>
              <p className="text-2xl font-bold text-green-500" data-testid="text-milestone-amount">
                ₹ {parseFloat(user.milestoneAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">Withdrawable balance</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Milestone Reward</p>
              <p className="text-2xl font-bold text-blue-500" data-testid="text-milestone-reward">
                ₹ {parseFloat(user.milestoneReward).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">Total withdrawn</p>
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
                data-testid="input-deposit-amount"
              />
            </div>
            <Button
              onClick={handleDeposit}
              disabled={depositMutation.isPending || !depositAmount}
              className="w-full"
              data-testid="button-add-deposit"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              {depositMutation.isPending ? "Adding..." : "Add Deposit"}
            </Button>
            <p className="text-sm text-muted-foreground">
              This will be added to the user's withdrawable balance (Milestone Amount).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
