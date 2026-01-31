import { AdminLayout } from "@/components/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Wallet, Plus, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Deposit {
  id: number;
  userId: string;
  amount: string;
  type: string;
  description: string | null;
  createdAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AdminDeposits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [depositType, setDepositType] = useState("manual");
  const [description, setDescription] = useState("");

  const { data: deposits, isLoading } = useQuery<Deposit[]>({
    queryKey: ["/api/admin/deposits"]
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"]
  });

  const addDepositMutation = useMutation({
    mutationFn: async (data: { userId: string; amount: string; type: string; description: string }) => {
      return apiRequest("POST", "/api/admin/deposits", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      setIsDialogOpen(false);
      setSelectedUserId("");
      setAmount("");
      setDescription("");
      toast({ title: "Deposit added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add deposit", variant: "destructive" });
    }
  });

  const handleAddDeposit = () => {
    if (!selectedUserId || !amount) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    addDepositMutation.mutate({
      userId: selectedUserId,
      amount,
      type: depositType,
      description
    });
  };

  if (!(user as any)?.isAdmin) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="text-zinc-400 hover:text-white"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Deposit Details</h1>
              <p className="text-zinc-400">{deposits?.length || 0} total deposits</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600" data-testid="button-add-deposit">
                <Plus className="w-4 h-4 mr-2" />
                Add Manual Deposit
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add Manual Deposit</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Add a manual deposit to a user's account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-white">Select User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {users?.map((u) => (
                        <SelectItem key={u.id} value={u.id} className="text-white">
                          {u.firstName} {u.lastName} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Amount (LKR)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    data-testid="input-deposit-amount"
                  />
                </div>
                <div>
                  <Label className="text-white">Deposit Type</Label>
                  <Select value={depositType} onValueChange={setDepositType}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="manual" className="text-white">Manual</SelectItem>
                      <SelectItem value="bonus" className="text-white">Bonus</SelectItem>
                      <SelectItem value="refund" className="text-white">Refund</SelectItem>
                      <SelectItem value="promotion" className="text-white">Promotion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Description (Optional)</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    data-testid="input-deposit-description"
                  />
                </div>
                <Button 
                  onClick={handleAddDeposit}
                  disabled={addDepositMutation.isPending}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  data-testid="button-submit-deposit"
                >
                  {addDepositMutation.isPending ? "Adding..." : "Add Deposit"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-zinc-900 border-zinc-700">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-700">
                  <TableHead className="text-zinc-400">ID</TableHead>
                  <TableHead className="text-zinc-400">User ID</TableHead>
                  <TableHead className="text-zinc-400">Amount</TableHead>
                  <TableHead className="text-zinc-400">Type</TableHead>
                  <TableHead className="text-zinc-400">Description</TableHead>
                  <TableHead className="text-zinc-400">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-zinc-400">Loading...</TableCell>
                  </TableRow>
                ) : !deposits?.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                      No deposits yet
                    </TableCell>
                  </TableRow>
                ) : (
                  deposits.map((d) => (
                    <TableRow key={d.id} className="border-zinc-700" data-testid={`row-deposit-${d.id}`}>
                      <TableCell className="font-mono text-sm text-white">#{d.id}</TableCell>
                      <TableCell className="font-mono text-xs text-zinc-400">
                        {d.userId.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/20 text-green-400 border-0">
                          +LKR {parseFloat(d.amount).toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-orange-500/50 text-orange-400">{d.type}</Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {d.description || "-"}
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {new Date(d.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
