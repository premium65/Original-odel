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
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdClick {
  id: number;
  userId: string;
  adId: number;
  earnedAmount: string;
  createdAt: string;
}

export default function AdminTransactionDetails() {
  const { user } = useAuth();

  const { data: transactions, isLoading } = useQuery<AdClick[]>({
    queryKey: ["/api/admin/transactions"]
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
        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <FileText className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Transaction Details</h1>
          <p className="text-muted-foreground">{transactions?.length || 0} total ad click transactions</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Ad ID</TableHead>
                <TableHead>Earned</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : !transactions?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No transactions yet
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.id} data-testid={`row-transaction-${t.id}`}>
                    <TableCell className="font-mono text-sm">#{t.id}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {t.userId.slice(0, 8)}...
                    </TableCell>
                    <TableCell>Ad #{t.adId}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/20 text-green-500">
                        +LKR {parseFloat(t.earnedAmount).toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString()}
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
