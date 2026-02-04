
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, Crown } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminPremiumPurchases() {
    const { data: purchases, isLoading } = useQuery({
        queryKey: ["admin-premium-purchases"],
        queryFn: () => api.getPremiumPurchases(),
    });

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Crown className="h-6 w-6 text-yellow-500" />
                        Premium Purchases
                    </h1>
                    <p className="text-muted-foreground">
                        View details of all premium plan purchases.
                    </p>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Plan ID</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!purchases || purchases.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No premium purchases found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            purchases.map((purchase: any) => (
                                <TableRow key={purchase.id}>
                                    <TableCell className="font-mono text-xs">{purchase.userId}</TableCell>
                                    <TableCell>{purchase.planId}</TableCell>
                                    <TableCell className="font-medium">
                                        {Number(purchase.amount).toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={purchase.status === "completed" ? "default" : "secondary"}>
                                            {purchase.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{purchase.paymentMethod || "-"}</TableCell>
                                    <TableCell>
                                        {purchase.createdAt ? format(new Date(purchase.createdAt), "PP p") : "-"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
