import { AdminLayout } from "@/components/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { PercentCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Commission {
  id: number;
  userId: string;
  referralId: string | null;
  amount: string;
  type: string;
  description: string | null;
  createdAt: string;
}

export default function AdminCommissions() {
  const { user } = useAuth();

  const { data: commissions, isLoading } = useQuery<Commission[]>({
    queryKey: ["/api/admin/commissions"]
  });

  if (!(user as any)?.isAdmin) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

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
        <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <PercentCircle className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Commissions</h1>
          <p className="text-muted-foreground">{commissions?.length || 0} total commissions</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Referral ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : !commissions?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No commissions yet
                  </TableCell>
                </TableRow>
              ) : (
                commissions.map((c) => (
                  <TableRow key={c.id} data-testid={`row-commission-${c.id}`}>
                    <TableCell className="font-mono text-sm">#{c.id}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {c.userId.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {c.referralId ? `${c.referralId.slice(0, 8)}...` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-purple-500/20 text-purple-500">
                        +LKR {parseFloat(c.amount).toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
