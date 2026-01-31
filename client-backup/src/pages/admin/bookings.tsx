import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminBookings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">Manage bookings and reservations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bookings Management</CardTitle>
          <CardDescription>This section is under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Bookings functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
