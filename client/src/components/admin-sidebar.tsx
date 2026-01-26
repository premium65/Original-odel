import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ShieldCheck,
  UserCog,
  Star,
  Crown,
  FileText,
  Wallet,
  PiggyBank,
  Percent,
  Megaphone,
  Globe,
  Phone,
  Mail,
  MessageCircle,
  Send,
  Info,
  FileQuestion,
  Shield,
  Layout,
  Home,
  SlidersHorizontal,
  Image,
  Type,
  Palette,
  ImageIcon,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  badge?: string;
  children?: MenuItem[];
}

interface MenuSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "USER MANAGEMENT",
    icon: Users,
    items: [
      { label: "All Users", icon: Users, path: "/admin/users" },
      { label: "Pending Users", icon: UserCheck, path: "/admin/pending" },
      { label: "Admins", icon: ShieldCheck, path: "/admin/admins" },
    ],
  },
  {
    title: "TRANSACTION",
    icon: Wallet,
    items: [
      { label: "Users", icon: UserCog, path: "/admin/transaction-users" },
      { label: "Premium Manage", icon: Star, path: "/admin/premium-manage", badge: "⭐" },
      { label: "Premium", icon: Crown, path: "/admin/premium", badge: "⭐" },
      { label: "Transaction Details", icon: FileText, path: "/admin/transactions" },
      { label: "Withdraw List", icon: Wallet, path: "/admin/withdrawals" },
      { label: "Deposit Details", icon: PiggyBank, path: "/admin/deposits" },
      { label: "Commission", icon: Percent, path: "/admin/commission" },
    ],
  },
  {
    title: "ADS MANAGEMENT",
    icon: Megaphone,
    items: [
      { label: "Manage Ads", icon: Megaphone, path: "/admin/ads" },
    ],
  },
  {
    title: "SOCIAL MEDIA",
    icon: Globe,
    badge: "NEW",
    items: [
      {
        label: "Contact Us",
        icon: Phone,
        children: [
          { label: "Phone", icon: Phone, path: "/admin/contact/phone" },
          { label: "Email", icon: Mail, path: "/admin/contact/email" },
          { label: "WhatsApp", icon: MessageCircle, path: "/admin/contact/whatsapp" },
          { label: "Telegram", icon: Send, path: "/admin/contact/telegram" },
        ],
      },
      {
        label: "Info",
        icon: Info,
        children: [
          { label: "About Us", icon: Info, path: "/admin/info/about" },
          { label: "Terms & Conditions", icon: FileQuestion, path: "/admin/info/terms" },
          { label: "Privacy Policy", icon: Shield, path: "/admin/info/privacy" },
        ],
      },
    ],
  },
  {
    title: "SITE CONTENT",
    icon: Layout,
    badge: "NEW",
    items: [
      { label: "Home Page", icon: Home, path: "/admin/content/home" },
      { label: "Dashboard Page", icon: SlidersHorizontal, path: "/admin/content/dashboard" },
      { label: "Slideshow Images", icon: Image, path: "/admin/slideshow" },
      { label: "Text & Labels", icon: Type, path: "/admin/content/text" },
    ],
  },
  {
    title: "APPEARANCE",
    icon: Palette,
    badge: "NEW",
    items: [
      { label: "Theme Colors", icon: Palette, path: "/admin/theme-settings" },
      { label: "Logo & Branding", icon: ImageIcon, path: "/admin/branding" },
    ],
  },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const [openSections, setOpenSections] = useState<string[]>(["USER MANAGEMENT", "TRANSACTION"]);
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (path?: string) => path && location === path;

  return (
    <Sidebar className="border-r border-[#2a3a4d] bg-[#1a2332]">
      <SidebarHeader className="p-4 border-b border-[#2a3a4d]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#ea580c] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">OdelADS</h1>
            <p className="text-[#6b7280] text-xs">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location === "/admin"}
                className={cn(
                  "w-full",
                  location === "/admin" && "bg-gradient-to-r from-[#f59e0b]/20 to-[#ea580c]/20 text-[#f59e0b] border-l-2 border-[#f59e0b]"
                )}
              >
                <Link href="/admin">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="font-semibold">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <SidebarGroup key={section.title}>
            <Collapsible
              open={openSections.includes(section.title)}
              onOpenChange={() => toggleSection(section.title)}
            >
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:text-white px-2 py-2 text-[#6b7280]">
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    <span className="text-xs font-semibold">{section.title}</span>
                    {section.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#10b981]/20 text-[#10b981] rounded">
                        {section.badge}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      openSections.includes(section.title) && "rotate-180"
                    )}
                  />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) =>
                      item.children ? (
                        <Collapsible
                          key={item.label}
                          open={openSubmenus.includes(item.label)}
                          onOpenChange={() => toggleSubmenu(item.label)}
                        >
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton className="w-full justify-between">
                                <div className="flex items-center gap-2">
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.label}</span>
                                </div>
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 transition-transform",
                                    openSubmenus.includes(item.label) && "rotate-180"
                                  )}
                                />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item.children.map((child) => (
                                  <SidebarMenuSubItem key={child.path}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isActive(child.path)}
                                      className={cn(
                                        isActive(child.path) && "bg-[#f59e0b]/20 text-[#f59e0b]"
                                      )}
                                    >
                                      <Link href={child.path || "#"}>
                                        <child.icon className="h-4 w-4" />
                                        <span>{child.label}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      ) : (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive(item.path)}
                            className={cn(
                              isActive(item.path) && "bg-[#f59e0b]/20 text-[#f59e0b]"
                            )}
                          >
                            <Link href={item.path || "#"}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="ml-auto text-lg">{item.badge}</span>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
