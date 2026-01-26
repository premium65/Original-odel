import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AdminTransactionUsers() {
  const [search, setSearch] = useState("");
  const { data: users = [] } = useQuery<any[]>({ queryKey: ["/api/admin/users"] });
  const filtered = users.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || u.fullName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#f59e0b]"><UserCog className="h-6 w-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Transaction Users</h1><p className="text-[#9ca3af]">View user transaction history</p></div>
      </div>
      <Card className="bg-[#1a2332] border-[#2a3a4d]">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-[#0f1419] border-[#2a3a4d] text-white placeholder:text-[#6b7280]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.slice(0, 20).map((user: any) => (
              <div key={user.id} className="p-3 rounded-lg bg-[#0f1419] border border-[#2a3a4d] flex justify-between items-center">
                <div><p className="text-white font-medium">{user.username}</p><p className="text-[#6b7280] text-sm">{user.fullName}</p></div>
                <div className="text-right"><p className="text-[#10b981] font-bold">LKR {parseFloat(user.milestoneAmount || 0).toFixed(2)}</p><p className="text-[#6b7280] text-xs">Milestone</p></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
