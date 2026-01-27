import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Withdrawal, User } from "@shared/schema";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminWithdrawals() {
  const { toast } = useToast();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery<Withdrawal[]>({ queryKey: ["/api/admin/withdrawals"] });
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/withdrawals/${id}/approve`, { method: "POST", headers: { "Content-Type": "application/json" } });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Withdrawal Approved", description: "The withdrawal has been processed successfully" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Approval Failed", description: error.message });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const response = await fetch(`/api/admin/withdrawals/${id}/reject`, { method: "POST", body: JSON.stringify({ notes }), headers: { "Content-Type": "application/json" } });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({ title: "Withdrawal Rejected", description: "The withdrawal request has been rejected" });
      setRejectDialogOpen(false);
      setSelectedWithdrawal(null);
      setRejectNotes("");
    },
  });

  const userMap = useMemo(() => {
    const map = new Map<number, User>();
    users.forEach(user => map.set(user.id, user));
    return map;
  }, [users]);

  const filteredWithdrawals = useMemo(() => {
    if (!searchQuery.trim()) return withdrawals;
    const query = searchQuery.toLowerCase();
    return withdrawals.filter((withdrawal) => {
      const user = userMap.get(withdrawal.userId);
      return withdrawal.id.toString().includes(query) || user?.fullName?.toLowerCase().includes(query) || withdrawal.amount.includes(query);
    });
  }, [withdrawals, userMap, searchQuery]);

  const isLoading = withdrawalsLoading || usersLoading;
  if (isLoading) return <div className="flex items-center justify-center h-96"><p className="text-muted-foreground">Loading withdrawals...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card border rounded-lg p-4">
        <h1 className="text-xl font-bold" style={{ color: '#B8936B' }}>Withdraw Request List</h1>
        <Input placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-xs" />
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead style={{ color: '#B8936B' }}>ID</TableHead>
              <TableHead style={{ color: '#B8936B' }}>NAME</TableHead>
              <TableHead style={{ color: '#B8936B' }}>DETAILS</TableHead>
              <TableHead style={{ color: '#B8936B' }}>PRICE</TableHead>
              <TableHead style={{ color: '#B8936B' }}>ACCEPT</TableHead>
              <TableHead style={{ color: '#B8936B' }}>REJECT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWithdrawals.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No withdrawal requests found</TableCell></TableRow>
            ) : (
              filteredWithdrawals.map((withdrawal) => {
                const user = userMap.get(withdrawal.userId);
                return (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-medium">{withdrawal.id}</TableCell>
                    <TableCell>{user?.fullName || 'Unknown User'}</TableCell>
                    <TableCell>
                      <p className="text-sm">Requested: {format(new Date(withdrawal.requestedAt), "PPP")}</p>
                      <p className="text-sm">Status: <span className={withdrawal.status === 'approved' ? 'text-green-500' : withdrawal.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}>{withdrawal.status.toUpperCase()}</span></p>
                    </TableCell>
                    <TableCell className="font-bold">₹ {parseFloat(withdrawal.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      {withdrawal.status === 'pending' ? (
                        <Button size="sm" onClick={() => approveMutation.mutate(withdrawal.id)} disabled={approveMutation.isPending} className="bg-green-600 hover:bg-green-700">ACCEPT</Button>
                      ) : withdrawal.status === 'approved' ? (
                        <span className="text-green-500 font-medium">✓ Approved</span>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      {withdrawal.status === 'pending' ? (
                        <Button size="sm" onClick={() => { setSelectedWithdrawal(withdrawal); setRejectDialogOpen(true); }} variant="destructive">REJECT</Button>
                      ) : withdrawal.status === 'rejected' ? (
                        <span className="text-red-500 font-medium">✗ Rejected</span>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Withdrawal Request</DialogTitle><DialogDescription>Are you sure you want to reject this withdrawal?</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="notes">Rejection Reason (Optional)</Label><Textarea id="notes" placeholder="Enter reason..." value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => selectedWithdrawal && rejectMutation.mutate({ id: selectedWithdrawal.id, notes: rejectNotes })} disabled={rejectMutation.isPending}>{rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}