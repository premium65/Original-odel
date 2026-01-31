import { AdminLayout } from "@/components/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { useWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from "@/hooks/use-withdrawals";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, CreditCard, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Label } from "@/components/ui/label";

export default function AdminWithdrawals() {
  const { user } = useAuth();
  const { data: withdrawals, isLoading } = useWithdrawals();
  const { mutate: approve, isPending: approving } = useApproveWithdrawal();
  const { mutate: reject, isPending: rejecting } = useRejectWithdrawal();
  
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (!(user as any)?.isAdmin) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  const handleReject = () => {
    if (rejectId && rejectReason) {
      reject({ id: rejectId, reason: rejectReason });
      setRejectId(null);
      setRejectReason("");
    }
  };

  const pendingCount = withdrawals?.filter(w => w.status === "pending").length || 0;
  const totalApproved = withdrawals
    ?.filter(w => w.status === "approved")
    .reduce((sum, w) => sum + parseFloat(w.amount || "0"), 0) || 0;

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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
          <CreditCard className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Withdraw List</h1>
          <p className="text-muted-foreground">
            {pendingCount} pending requests | LKR {totalApproved.toFixed(2)} total approved
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : !withdrawals?.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No withdrawal requests
                  </TableCell>
                </TableRow>
              ) : (
                withdrawals.map((w) => (
                  <TableRow key={w.id} data-testid={`row-withdrawal-${w.id}`}>
                    <TableCell className="font-mono">#{w.id}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {w.userId.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-500/20 text-amber-500">
                        LKR {parseFloat(w.amount).toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>{w.method}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                      {w.accountDetails}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          w.status === "approved" ? "default" :
                          w.status === "rejected" ? "destructive" : "secondary"
                        }
                        className={w.status === "approved" ? "bg-green-500/20 text-green-500" : ""}
                      >
                        {w.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      {w.status === "pending" && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            className="bg-green-600 hover:bg-green-700 h-8 w-8"
                            onClick={() => approve(w.id)}
                            disabled={approving}
                            data-testid={`button-approve-${w.id}`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            onClick={() => setRejectId(w.id)}
                            disabled={rejecting}
                            data-testid={`button-reject-${w.id}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {w.status === "rejected" && w.reason && (
                        <span className="text-xs text-destructive">
                          {w.reason}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={rejectId !== null} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Rejection Reason</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="mt-2"
              data-testid="input-reject-reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason}
              data-testid="button-confirm-reject"
            >
              Reject Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
