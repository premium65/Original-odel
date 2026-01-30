import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin-sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Sun, Search, Menu } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: currentUser, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  console.log("[ADMIN_LAYOUT] Current user data:", currentUser);
  console.log("[ADMIN_LAYOUT] isAdmin value:", currentUser?.isAdmin);
  console.log("[ADMIN_LAYOUT] isAdmin type:", typeof currentUser?.isAdmin);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    toast({ title: "Logged out successfully" });
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6b7280]">Loading...</p>
        </div>
      </div>
    );
  }

  console.log("[ADMIN_LAYOUT] Current user data:", currentUser);
  console.log("[ADMIN_LAYOUT] isAdmin value:", currentUser?.isAdmin);
  console.log("[ADMIN_LAYOUT] isAdmin type:", typeof currentUser?.isAdmin);
  console.log("[ADMIN_LAYOUT] Number(isAdmin):", Number(currentUser?.isAdmin));
  console.log("[ADMIN_LAYOUT] Number(isAdmin) !== 1:", Number(currentUser?.isAdmin) !== 1);

  if (!currentUser || Number(currentUser.isAdmin) !== 1) {
    console.log("[ADMIN_LAYOUT] Access denied - redirecting to login");
    console.log("[ADMIN_LAYOUT] User exists:", !!currentUser);
    console.log("[ADMIN_LAYOUT] isAdmin check:", currentUser?.isAdmin, "!== 1");
    console.log("[ADMIN_LAYOUT] Final check result:", Number(currentUser?.isAdmin) !== 1);
    setLocation("/login");
    return null;
  }

  const style = {
    "--sidebar-width": "280px",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-[#0f1419]">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between gap-4 px-6 py-4 bg-[#1a2332] border-b border-[#2a3a4d]">
            <div className="flex items-center gap-4">
              <SidebarTrigger 
                data-testid="button-sidebar-toggle" 
                className="p-2 text-[#9ca3af] hover:text-white hover:bg-[#2a3a4d] rounded-lg"
              />
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2.5 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white text-sm placeholder:text-[#6b7280] focus:border-[#10b981] focus:outline-none w-72"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2.5 text-[#9ca3af] hover:text-white hover:bg-[#2a3a4d] rounded-xl bg-[#0f1419] border border-[#2a3a4d]">
                <Sun className="w-5 h-5" />
              </button>
              <button className="p-2.5 text-[#9ca3af] hover:text-white hover:bg-[#2a3a4d] rounded-xl bg-[#0f1419] border border-[#2a3a4d] relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#ef4444] rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 px-3 py-2 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#eab308] flex items-center justify-center text-white font-bold">
                  {currentUser.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-white">{currentUser.username}</p>
                  <p className="text-[10px] text-[#6b7280]">Administrator</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                onClick={handleLogout} 
                data-testid="button-logout"
                className="flex items-center gap-2 px-4 py-2.5 text-[#9ca3af] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-xl"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">Logout</span>
              </Button>
            </div>
          </header>
          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6 bg-[#0f1419]">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
