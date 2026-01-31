import { LayoutShell } from "@/components/layout-shell";
import { useAuth } from "@/hooks/use-auth";
import { useUsersList, useUpdateUserStatus, useAdminDeposit } from "@/hooks/use-users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Ban, CheckCircle, Wallet, Edit, ArrowLeft } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminUsers() {
  const { user } = useAuth();
  const { data: users, isLoading } = useUsersList();
  const { mutate: updateStatus } = useUpdateUserStatus();
  const { mutate: deposit } = useAdminDeposit();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [depositUserId, setDepositUserId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  if (!(user as any)?.isAdmin) return null;

  const filteredUsers = users?.filter(u => 
    u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeposit = () => {
    if (depositUserId && depositAmount) {
      deposit({ id: depositUserId, amount: depositAmount });
      setDepositUserId(null);
      setDepositAmount("");
    }
  };

  return (
    <LayoutShell>
      <Button 
        variant="ghost" 
        onClick={() => window.history.back()}
        className="text-zinc-400 hover:text-white mb-4"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts, approvals and balances</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Completed Ads</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Loading users...</TableCell>
              </TableRow>
            ) : filteredUsers?.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{u.firstName} {u.lastName}</span>
                    <span className="text-xs text-muted-foreground">{u.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    u.status === 'active' ? 'default' : 
                    u.status === 'frozen' ? 'destructive' : 'secondary'
                  }>
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {Number(u.milestoneAmount).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">{u.totalAdsCompleted}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* Status Actions */}
                    {u.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus({ id: u.id, status: 'active' })}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    )}
                    
                    {u.status === 'active' && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => updateStatus({ id: u.id, status: 'frozen' })}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}

                    {u.status === 'frozen' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateStatus({ id: u.id, status: 'active' })}
                      >
                        Unfreeze
                      </Button>
                    )}

                    {/* Deposit Dialog */}
                    <Dialog open={depositUserId === u.id} onOpenChange={(open) => !open && setDepositUserId(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => setDepositUserId(u.id)}
                        >
                          <Wallet className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manual Deposit</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Amount (LKR)</Label>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleDeposit}>Deposit Funds</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </LayoutShell>
  );
}
