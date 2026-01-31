import { AdminLayout } from "@/components/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { useUsersList } from "@/hooks/use-users";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminAdmins() {
  const { user } = useAuth();
  const { data: users, isLoading } = useUsersList();

  if (!(user as any)?.isAdmin) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  const adminUsers = users?.filter(u => u.isAdmin) || [];

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
        <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <Shield className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Administrators</h1>
          <p className="text-muted-foreground">{adminUsers.length} admin accounts</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : adminUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No admin users
                  </TableCell>
                </TableRow>
              ) : (
                adminUsers.map((u) => (
                  <TableRow key={u.id} data-testid={`row-admin-${u.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={u.profileImageUrl || undefined} />
                          <AvatarFallback className="bg-amber-500/20 text-amber-500">
                            {u.firstName?.[0] || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.firstName} {u.lastName}</p>
                          <Badge className="bg-amber-500/20 text-amber-500 mt-1">Administrator</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={u.status === "active" ? "default" : "secondary"}
                        className={u.status === "active" ? "bg-green-500/20 text-green-500" : ""}
                      >
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
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
