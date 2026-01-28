import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Wallet,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  CreditCard
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Re-verify admin status - type assertion since user claims are loose
  const isAdmin = (user as any)?.isAdmin === true;

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Withdraw", href: "/withdraw", icon: Wallet },
    // { label: "Profile", href: "/profile", icon: User },
  ];

  const adminItems = [
    { label: "Admin Overview", href: "/admin", icon: ShieldCheck },
    { label: "Users", href: "/admin/users", icon: User },
    { label: "Withdrawals", href: "/admin/withdrawals", icon: CreditCard },
    { label: "Manage Ads", href: "/admin/ads", icon: LayoutDashboard },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/10">
        <h1 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
          AdClicker
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Earn money watching ads</p>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          User Menu
        </div>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer group",
                location === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", location === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {item.label}
            </div>
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="mt-8 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin Control
            </div>
            {adminItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer group",
                    location === item.href
                      ? "bg-amber-500/10 text-amber-500"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("mr-3 h-5 w-5", location === item.href ? "text-amber-500" : "text-muted-foreground group-hover:text-foreground")} />
                  {item.label}
                </div>
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-border/10 bg-card/50">
        <div className="flex items-center gap-3 mb-4">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-border" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.firstName?.[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full shadow-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-card shadow-2xl animate-in slide-in-from-left duration-200">
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 border-r border-border/40 bg-card sticky top-0 h-screen">
        <NavContent />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
