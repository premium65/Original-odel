import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard,
  Users,
  UserCheck,
  UserCog,
  ShieldCheck,
  CreditCard,
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
  ChevronRight,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  badge?: string;
  badgeColor?: string;
  children?: MenuItem[];
}

interface MenuGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  badge?: string;
  items: MenuItem[];
}

const menuStructure: MenuGroup[] = [
  {
    title: "USER MANAGEMENT",
    icon: Users,
    gradient: "from-blue-500 to-cyan-500",
    items: [
      { label: "All Users", icon: Users, path: "/admin/users" },
      { label: "Pending Users", icon: UserCheck, path: "/admin/pending" },
      { label: "Admins", icon: ShieldCheck, path: "/admin/admins" },
    ]
  },
  {
    title: "TRANSACTION",
    icon: CreditCard,
    gradient: "from-amber-500 to-orange-500",
    items: [
      { label: "Users", icon: UserCog, path: "/admin/transaction-users" },
      { label: "Premium Manage", icon: Star, path: "/admin/premium-manage", badge: "⭐", badgeColor: "text-amber-400" },
      { label: "Premium", icon: Crown, path: "/admin/premium", badge: "⭐", badgeColor: "text-amber-400" },
      { label: "Transaction Details", icon: FileText, path: "/admin/transactions" },
      { label: "Withdraw List", icon: Wallet, path: "/admin/withdrawals" },
      { label: "Deposit Details", icon: PiggyBank, path: "/admin/deposits" },
      { label: "Commission", icon: Percent, path: "/admin/commission" },
    ]
  },
  {
    title: "ADS MANAGEMENT",
    icon: Megaphone,
    gradient: "from-purple-500 to-pink-500",
    items: [
      { label: "Manage Ads", icon: Megaphone, path: "/admin/ads" },
    ]
  },
  {
    title: "SOCIAL MEDIA",
    icon: Globe,
    gradient: "from-green-500 to-emerald-500",
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
    gradient: "from-indigo-500 to-violet-500",
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
    gradient: "from-rose-500 to-red-500",
    badge: "NEW",
    items: [
      { label: "Theme Colors", icon: Palette, path: "/admin/theme-settings" },
      { label: "Logo & Branding", icon: ImageIcon, path: "/admin/branding" },
    ]
  },
];

export default function AdminSidebar() {
  const [location] = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["USER MANAGEMENT", "TRANSACTION"]);
  const [expandedSubmenus, setExpandedSubmenus] = useState<string[]>([]);

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => 
      prev.includes(title) 
        ? prev.filter(g => g !== title)
        : [...prev, title]
    );
  };

  const toggleSubmenu = (label: string) => {
    setExpandedSubmenus(prev => 
      prev.includes(label) 
        ? prev.filter(s => s !== label)
        : [...prev, label]
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
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
              "text-gray-400 hover:text-white hover:bg-white/5"
            )}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-600">
                {depth === 0 ? "├─" : "│  ├─"}
              </span>
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4">
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
            "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
            active 
              ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-l-2 border-amber-500" 
              : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-600">
              {depth === 0 ? "├─" : "│  ├─"}
            </span>
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </div>
          {item.badge && (
            <span className={cn("text-lg", item.badgeColor || "text-amber-400")}>
              {item.badge}
            </span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="w-64 bg-[#0d0d1a] border-r border-gray-800 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <div>
            <h1 className="text-white font-bold">OdelADS</h1>
            <p className="text-gray-500 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {/* Dashboard - Always visible */}
        <Link href="/admin">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
              location === "/admin"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </div>
        </Link>

        {/* Menu Groups */}
        {menuStructure.map(group => (
          <div key={group.title} className="pt-2">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <group.icon className={cn("h-4 w-4 bg-gradient-to-r bg-clip-text", group.gradient)} />
                <span>{group.title}</span>
                {group.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded">
                    {group.badge}
                  </span>
                )}
              </div>
              {expandedGroups.includes(group.title) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {/* Group Items */}
            {expandedGroups.includes(group.title) && (
              <div className="mt-1 space-y-0.5">
                {group.items.map(item => renderMenuItem(item))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-800">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
