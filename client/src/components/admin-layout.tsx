import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Shield,
  Receipt,
  Star,
  FileText,
  CreditCard,
  Wallet,
  PercentCircle,
  Megaphone,
  MessageSquare,
  Phone,
  Mail,
  Send,
  Info,
  FileQuestion,
  Lock,
  Home,
  PanelTop,
  Image,
  Type,
  Palette,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Search,
  Bell
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MenuItem {
  label: string;
  href?: string;
  icon: any;
  badge?: string;
  children?: MenuItem[];
}

const adminMenuItems: MenuItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    label: "User Management",
    icon: Users,
    children: [
      { label: "All Users", href: "/admin/users", icon: Users },
      { label: "Pending Users", href: "/admin/users/pending", icon: UserCheck },
      { label: "Admins", href: "/admin/users/admins", icon: Shield },
    ]
  },
  {
    label: "Transaction",
    icon: Receipt,
    children: [
      { label: "Users", href: "/admin/transactions/users", icon: Users },
      { label: "Premium Manage", href: "/admin/transactions/premium", icon: Star, badge: "NEW" },
      { label: "Premium Plans", href: "/admin/transactions/premium-plans", icon: Star, badge: "NEW" },
      { label: "Premium Users", href: "/admin/transactions/premium-users", icon: UserCheck, badge: "NEW" },
      { label: "Premium History", href: "/admin/transactions/premium-history", icon: FileText, badge: "NEW" },
      { label: "Transaction Details", href: "/admin/transactions/details", icon: FileText },
      { label: "Withdraw List", href: "/admin/withdrawals", icon: CreditCard },
      { label: "Deposit Details", href: "/admin/deposits", icon: Wallet },
      { label: "Commission", href: "/admin/commissions", icon: PercentCircle },
    ]
  },
  {
    label: "Ads Management",
    icon: Megaphone,
    children: [
      { label: "Manage Ads", href: "/admin/ads", icon: Megaphone },
    ]
  },
  {
    label: "Social Media",
    icon: MessageSquare,
    badge: "NEW",
    children: [
      { label: "Phone", href: "/admin/contact/phone", icon: Phone },
      { label: "Email", href: "/admin/contact/email", icon: Mail },
      { label: "WhatsApp", href: "/admin/contact/whatsapp", icon: Send },
      { label: "Telegram", href: "/admin/contact/telegram", icon: Send },
      { label: "About Us", href: "/admin/pages/about", icon: Info },
      { label: "Terms & Conditions", href: "/admin/pages/terms", icon: FileQuestion },
      { label: "Privacy Policy", href: "/admin/pages/privacy", icon: Lock },
    ]
  },
  {
    label: "Site Content",
    icon: PanelTop,
    badge: "NEW",
    children: [
      { label: "Home Page", href: "/admin/content/home", icon: Home },
      { label: "Dashboard Settings", href: "/admin/cms/dashboard", icon: LayoutDashboard, badge: "NEW" },
      { label: "Slideshow Images", href: "/admin/slides", icon: Image },
      { label: "Text & Labels", href: "/admin/content/labels", icon: Type },
    ]
  },
  {
    label: "Appearance",
    icon: Palette,
    badge: "NEW",
    children: [
      { label: "Theme Colors", href: "/admin/appearance/theme", icon: Palette },
      { label: "Logo & Branding", href: "/admin/appearance/branding", icon: Settings },
    ]
  },
];

function MenuItemComponent({ item, depth = 0 }: { item: MenuItem; depth?: number }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(
    item.children?.some(child => location.startsWith(child.href || '')) || false
  );
  
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? location === item.href : false;
  const isParentActive = item.children?.some(child => location === child.href);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            isParentActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
            {item.badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-black rounded">
                {item.badge}
              </span>
            )}
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1 border-l border-border/30 pl-3">
            {item.children?.map((child) => (
              <MenuItemComponent key={child.href} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={item.href || "#"}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
        <span>{item.label}</span>
        {item.badge && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-black rounded ml-auto">
            {item.badge}
          </span>
        )}
      </div>
    </Link>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <div>
            <h1 className="text-lg font-light tracking-[0.2em] text-foreground">ODEL</h1>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {adminMenuItems.map((item) => (
          <MenuItemComponent key={item.label} item={item} />
        ))}
      </nav>

      <div className="p-4 border-t border-border/20">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {user?.firstName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">Administrator</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => logout()}
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full shadow-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-card shadow-2xl animate-in slide-in-from-left duration-200">
            <NavContent />
          </div>
        </div>
      )}

      <div className="hidden lg:block w-64 border-r border-border/40 bg-card sticky top-0 h-screen overflow-hidden">
        <NavContent />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border/40 px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 bg-muted/50"
                data-testid="input-search"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button size="icon" variant="ghost" data-testid="button-settings">
                <Settings className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 pl-3 border-l border-border/40">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {user?.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user?.firstName}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
