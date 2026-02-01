import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Star, 
  MessageSquare, 
  Wallet,
  Calendar,
  BookOpen,
  TrendingUp,
  Crown,
  CreditCard,
  DollarSign,
  Share2,
  UserCog
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Ads",
    url: "/admin/ads",
    icon: Calendar,
  },
  {
    title: "Withdraw List",
    url: "/admin/withdrawals",
    icon: BookOpen,
  },
  {
    title: "Transaction Details",
    url: "/admin/transactions",
    icon: TrendingUp,
  },
  {
    title: "Premium",
    url: "/admin/premium",
    icon: Crown,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Deposit Details",
    url: "/admin/deposits",
    icon: CreditCard,
  },
  {
    title: "Commission",
    url: "/admin/commission",
    icon: DollarSign,
  },
  {
    title: "Social Media",
    url: "/admin/social-media",
    icon: Share2,
  },
  {
    title: "Admins",
    url: "/admin/admins",
    icon: UserCog,
  },
];

export function AdminSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Star className="h-6 w-6 text-sidebar-primary" />
          <span className="text-lg font-bold">Rating - Ads Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
