import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Download, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const dummyHistory = [
  { id: 1, user: "John Doe", plan: "Gold Premium", amount: 15000, type: "purchase", date: "2026-01-28 10:30", status: "completed" },
  { id: 2, user: "Jane Smith", plan: "Diamond Premium", amount: 45000, type: "purchase", date: "2026-01-28 09:15", status: "completed" },
  { id: 3, user: "Mike Johnson", plan: "Basic Premium", amount: 5000, type: "renewal", date: "2026-01-27 16:45", status: "completed" },
  { id: 4, user: "Sarah Williams", plan: "Gold Premium", amount: 15000, type: "purchase", date: "2026-01-27 14:20", status: "completed" },
  { id: 5, user: "Tom Brown", plan: "Basic Premium", amount: 5000, type: "refund", date: "2026-01-26 11:00", status: "refunded" },
  { id: 6, user: "Emily Davis", plan: "Diamond Premium", amount: 45000, type: "upgrade", date: "2026-01-26 09:30", status: "completed" },
];

export default function PremiumHistoryPage() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Premium History</h1>
            <p className="text-sm text-muted-foreground">View all premium subscription transactions</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Today's Revenue</p>
                  <p className="text-2xl font-bold">LKR 60,000</p>
                </div>
                <div className="flex items-center gap-1 text-green-500 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  +25%
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">LKR 185,000</p>
                </div>
                <div className="flex items-center gap-1 text-green-500 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  +18%
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">LKR 450,000</p>
                </div>
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <TrendingDown className="h-4 w-4" />
                  -5%
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Refunds</p>
                  <p className="text-2xl font-bold">LKR 15,000</p>
                </div>
                <div className="text-xs text-muted-foreground">3 refunds</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle>Transaction History</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-9 bg-zinc-800 border-zinc-700 w-full sm:w-48" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 w-full sm:w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="renewal">Renewal</SelectItem>
                    <SelectItem value="upgrade">Upgrade</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyHistory.map((item) => (
                    <TableRow key={item.id} className="border-zinc-800" data-testid={`row-history-${item.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-zinc-700 text-xs">{item.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{item.user}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{item.plan}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          item.type === 'purchase' ? 'bg-green-500/20 text-green-400' :
                          item.type === 'renewal' ? 'bg-blue-500/20 text-blue-400' :
                          item.type === 'upgrade' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {item.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${item.type === 'refund' ? 'text-red-400' : 'text-green-400'}`}>
                          {item.type === 'refund' ? '-' : '+'}LKR {item.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{item.date}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {item.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
