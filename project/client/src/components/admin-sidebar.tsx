import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard,
  Users,
  UserCheck,
  ShieldCheck,
  CreditCard,
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
  ChevronRight,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  badge?: string;
  badgeType?: "star" | "new";
  children?: MenuItem[];
}

interface MenuGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
  items: MenuItem[];
}

const menuStructure: MenuGroup[] = [
  {
    title: "USER MANAGEMENT",
    icon: Users,
    color: "text-[#06b6d4]", // Cyan
    items: [
      { label: "All Users", icon: Users, path: "/admin/users" },
      { label: "Pending Users", icon: UserCheck, path: "/admin/pending" },
      { label: "Admins", icon: ShieldCheck, path: "/admin/admins" },
    ]
  },
  {
    title: "TRANSACTION",
    icon: CreditCard,
    color: "text-[#10b981]", // Green
    items: [
      { label: "Users", icon: Users, path: "/admin/transaction-users" },
      { label: "Premium Manage", icon: Crown, path: "/admin/premium-manage", badge: "⭐", badgeType: "star" },
      { label: "Premium", icon: Crown, path: "/admin/premium", badge: "NEW", badgeType: "new" },
      { label: "Transaction Details", icon: FileText, path: "/admin/transactions" },
      { label: "Withdraw List", icon: Wallet, path: "/admin/withdrawals" },
      { label: "Deposit Details", icon: PiggyBank, path: "/admin/deposits" },
      { label: "Commission", icon: Percent, path: "/admin/commission" },
    ]
  },
  {
    title: "ADS MANAGEMENT",
    icon: Megaphone,
    color: "text-[#f59e0b]", // Orange
    items: [
      { label: "Manage Ads", icon: Megaphone, path: "/admin/ads" },
    ]
  },
  {
    title: "SOCIAL MEDIA",
    icon: Globe,
    color: "text-[#10b981]", // Green
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
        ]
      },
      { 
        label: "Info", 
        icon: Info,
        children: [
          { label: "About Us", icon: Info, path: "/admin/info/about" },
          { label: "Terms & Conditions", icon: FileQuestion, path: "/admin/info/terms" },
          { label: "Privacy Policy", icon: Shield, path: "/admin/info/privacy" },
        ]
      },
    ]
  },
  {
    title: "SITE CONTENT",
    icon: Layout,
    color: "text-[#8b5cf6]", // Purple
    badge: "NEW",
    items: [
      { label: "Home Page", icon: Home, path: "/admin/content/home" },
      { label: "Dashboard Page", icon: SlidersHorizontal, path: "/admin/content/dashboard" },
      { label: "Slideshow Images", icon: Image, path: "/admin/slideshow" },
      { label: "Text & Labels", icon: Type, path: "/admin/content/text" },
    ]
  },
  {
    title: "APPEARANCE",
    icon: Palette,
    color: "text-[#ec4899]", // Pink
    badge: "NEW",
    items: [
      { label: "Theme Colors", icon: Palette, path: "/admin/theme-settings" },
      { label: "Logo & Branding", icon: ImageIcon, path: "/admin/branding" },
    ]
  },
];

export default function AdminSidebar() {
  const [location] = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["USER MANAGEMENT", "TRANSACTION", "ADS MANAGEMENT", "SOCIAL MEDIA"]);
  const [expandedSubmenus, setExpandedSubmenus] = useState<string[]>([]);

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => 
      prev.includes(title) ? prev.filter(g => g !== title) : [...prev, title]
    );
  };

  const toggleSubmenu = (label: string) => {
    setExpandedSubmenus(prev => 
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  const isActive = (path?: string) => path && location === path;

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSubmenus.includes(item.label);
    const active = isActive(item.path);

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleSubmenu(item.label)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#9ca3af] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </div>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children!.map(child => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.path} href={item.path || "#"}>
        <div
          className={cn(
            "flex items-center justify-between px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors",
            active 
              ? "bg-[#10b981]/20 text-[#10b981]" 
              : "text-[#9ca3af] hover:text-white hover:bg-white/5"
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </div>
          {item.badge && item.badgeType === "star" && (
            <span className="text-[#f59e0b] text-lg">⭐</span>
          )}
          {item.badge && item.badgeType === "new" && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#ef4444] text-white rounded">NEW</span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="w-64 bg-[#1a2332] border-r border-[#2a3a4d] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-[#2a3a4d]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#10b981] to-[#06b6d4] flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <div>
            <h1 className="text-white font-bold">OdelADS</h1>
            <p className="text-[#6b7280] text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        <Link href="/admin">
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors",
              location === "/admin"
                ? "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30"
                : "text-[#9ca3af] hover:text-white hover:bg-white/5"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </div>
        </Link>

        {/* Menu Groups */}
        {menuStructure.map(group => (
          <div key={group.title} className="pt-3">
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <group.icon className={cn("h-4 w-4", group.color)} />
                <span className={group.color}>{group.title}</span>
                {group.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#f59e0b] text-white rounded">{group.badge}</span>
                )}
              </div>
              {expandedGroups.includes(group.title) ? (
                <ChevronDown className={cn("h-4 w-4", group.color)} />
              ) : (
                <ChevronRight className={cn("h-4 w-4", group.color)} />
              )}
            </button>
            {expandedGroups.includes(group.title) && (
              <div className="mt-1 space-y-1 ml-2">
                {group.items.map(item => renderMenuItem(item))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[#2a3a4d]">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
