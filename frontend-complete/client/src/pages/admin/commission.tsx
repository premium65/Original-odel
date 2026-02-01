import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCommission() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Commission</h1>
        <p className="text-muted-foreground">Manage commission settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Management</CardTitle>
          <CardDescription>This section is under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Commission settings will be configured here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
