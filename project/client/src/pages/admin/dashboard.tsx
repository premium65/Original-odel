import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import type { User, Withdrawal } from "@shared/schema";

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalCommission: string;
  totalWithdraw: string;
  totalDeposit: string;
}

export default function AdminDashboard() {
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/admin/withdrawals"],
  });

  // Calculate statistics
  const stats: DashboardStats = {
    totalUsers: users.length,
    totalBookings: 0, // Placeholder for now
    totalCommission: users.reduce((sum, user) => sum + parseFloat(user.milestoneReward), 0).toFixed(2),
    totalWithdraw: withdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + parseFloat(w.amount), 0)
      .toFixed(2),
    totalDeposit: users.reduce((sum, user) => sum + parseFloat(user.milestoneAmount), 0).toFixed(2),
  };

  const isLoading = usersLoading || withdrawalsLoading;

  const statCards = [
    {
      title: "TOTAL USERS",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "TOTAL BOOKING",
      value: stats.totalBookings.toString(),
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "TOTAL COMMISSION",
      value: parseFloat(stats.totalCommission).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      icon: DollarSign,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "TOTAL WITHDRAW",
      value: parseFloat(stats.totalWithdraw).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      icon: TrendingDown,
      color: "from-red-500 to-red-600",
    },
    {
      title: "TOTAL DEPOSIT",
      value: parseFloat(stats.totalDeposit).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
    },
  ];

  // Get pending user approvals for high priority section
  const pendingUsers = users.filter(u => u.status === 'pending').slice(0, 4);
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: '#B8936B' }}>Dashboard</h1>
        <p className="text-muted-foreground">Hello, welcome to HolidayInn!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-card border">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-3 rounded-full bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold" style={{ color: '#B8936B' }}>
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  {stat.title}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* High Priority Assignments */}
      <div>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#B8936B' }}>
          High Priority Assignments
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Pending User Approvals */}
          {pendingUsers.length > 0 && pendingUsers.map((user) => (
            <Card key={`user-${user.id}`} className="bg-amber-50 dark:bg-amber-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">
                    {new Date(user.registeredAt).toLocaleDateString()}
                  </CardDescription>
                  <Users className="h-4 w-4 text-amber-600" />
                </div>
                <CardTitle className="text-base">User Approval Required</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  New user <strong>{user.fullName}</strong> (@{user.username}) is waiting for account approval.
                </p>
              </CardContent>
            </Card>
          ))}

          {/* Pending Withdrawals */}
          {pendingWithdrawals.length > 0 && pendingWithdrawals.map((withdrawal) => {
            const user = users.find(u => u.id === withdrawal.userId);
            return (
              <Card key={`withdrawal-${withdrawal.id}`} className="bg-red-50 dark:bg-red-950/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs">
                      {new Date(withdrawal.requestedAt).toLocaleDateString()}
                    </CardDescription>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </div>
                  <CardTitle className="text-base">Withdrawal Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {user?.fullName || 'User'} requested withdrawal of ₹{parseFloat(withdrawal.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}.
                  </p>
                </CardContent>
              </Card>
            );
          })}

          {/* Placeholder if no priority items */}
          {pendingUsers.length === 0 && pendingWithdrawals.length === 0 && (
            <Card className="bg-green-50 dark:bg-green-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">
                    {new Date().toLocaleDateString()}
                  </CardDescription>
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle className="text-base">All Clear!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No pending approvals or urgent actions required at this time.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold" style={{ color: '#B8936B' }}>
            Recent Users
          </h2>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Registered</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.slice(0, 5).map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          user.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(user.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        ₹ {parseFloat(user.milestoneReward).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
