import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSocialMedia() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Social Media</h1>
        <p className="text-muted-foreground">Manage social media links and settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Social Media Management</CardTitle>
          <CardDescription>This section is under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Social media settings will be managed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
