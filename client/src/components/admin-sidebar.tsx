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
  UserCog,
  Target,
  UserCheck
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Pending Users",
    url: "/admin/pending",
    icon: UserCheck,
  },
  {
    title: "Premium Manage",
    url: "/admin/premium-manage",
    icon: Target,
    isNew: true,
  },
  {
    title: "Premium",
    url: "/admin/premium",
    icon: Crown,
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
    <Sidebar className="bg-[#1a2332] border-r border-[#2a3a4d]">
      <SidebarHeader className="p-4 border-b border-[#2a3a4d]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#eab308] flex items-center justify-center shadow-lg">
            <Star className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white block">RATING</span>
            <span className="text-[10px] text-[#6b7280] uppercase tracking-widest">Ads Admin</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-[#1a2332]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#10b981] uppercase text-xs tracking-wider px-4 py-2">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    className={`mx-2 rounded-lg transition-all ${
                      location === item.url 
                        ? 'bg-[#10b981]/20 text-[#10b981] border-l-2 border-[#10b981]' 
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#2a3a4d]'
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3 px-3 py-2.5">
                      <item.icon className={`h-4 w-4 ${item.title === 'Premium Manage' ? 'text-[#f59e0b]' : ''}`} />
                      <span className="flex-1">{item.title}</span>
                      {item.isNew && (
                        <span className="px-1.5 py-0.5 text-[8px] bg-[#ef4444] text-white rounded font-bold animate-pulse">
                          NEW
                        </span>
                      )}
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
