import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAdmins() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admins</h1>
        <p className="text-muted-foreground">Manage admin users and permissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Management</CardTitle>
          <CardDescription>This section is under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Admin users will be managed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
