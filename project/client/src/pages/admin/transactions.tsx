import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminTransactions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction Details</h1>
        <p className="text-muted-foreground">View all transaction history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>This section is under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Transaction details will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
