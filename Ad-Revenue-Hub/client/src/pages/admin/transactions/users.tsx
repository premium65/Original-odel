import { AdminLayout } from "@/components/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { useUsersList } from "@/hooks/use-users";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Users, Search, Eye, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AdminTransactionUsers() {
  const { user } = useAuth();
  const { data: users, isLoading } = useUsersList();
  const [search, setSearch] = useState("");

  if (!(user as any)?.isAdmin) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  const filteredUsers = users?.filter(u => 
    u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalBalance = users?.reduce((sum, u) => sum + parseFloat(u.milestoneAmount || "0"), 0) || 0;

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
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">User Transactions</h1>
            <p className="text-muted-foreground">
              Total Balance: LKR {totalBalance.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-transaction-users"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Today's Earnings</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Ads Completed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} data-testid={`row-transaction-user-${u.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={u.profileImageUrl || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {u.firstName?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/20 text-green-500">
                        LKR {parseFloat(u.milestoneAmount || "0").toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-500/20 text-amber-500">
                        LKR {parseFloat(u.milestoneReward || "0").toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        LKR {parseFloat(u.pendingAmount || "0").toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>{u.totalAdsCompleted || 0}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/transactions/premium?userId=${u.id}`}>
                        <Button size="sm" variant="outline" data-testid={`button-view-user-${u.id}`}>
                          <Eye className="mr-1 h-4 w-4" />
                          Manage
                        </Button>
                      </Link>
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
