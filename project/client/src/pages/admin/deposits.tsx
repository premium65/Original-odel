import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDeposits() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deposit Details</h1>
        <p className="text-muted-foreground">View and manage user deposits</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposit History</CardTitle>
          <CardDescription>This section is under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Deposit details will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
