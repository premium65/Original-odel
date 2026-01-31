import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import SplashPage from "@/pages/splash";
import LandingPage from "@/pages/landing";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import WithdrawPage from "@/pages/withdraw";
import ExclusivesPage from "@/pages/exclusives";
import StatusPage from "@/pages/status";
import AdsHubPage from "@/pages/ads-hub";
import ContactPage from "@/pages/contact";
import EventsPage from "@/pages/events";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";
import PendingAccountPage from "@/pages/pending-account";
import AdminLoginPage from "@/pages/admin-login";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminAllUsers from "@/pages/admin/users/index";
import AdminPendingUsers from "@/pages/admin/users/pending";
import AdminAdmins from "@/pages/admin/users/admins";
import AdminTransactionUsers from "@/pages/admin/transactions/users";
import AdminPremiumManage from "@/pages/admin/transactions/premium";
import AdminPremiumPlans from "@/pages/admin/transactions/premium-plans";
import AdminPremiumUsers from "@/pages/admin/transactions/premium-users";
import AdminPremiumHistory from "@/pages/admin/transactions/premium-history";
import AdminTransactionDetails from "@/pages/admin/transactions/details";
import AdminWithdrawals from "@/pages/admin/withdrawals";
import AdminDeposits from "@/pages/admin/deposits";
import AdminCommissions from "@/pages/admin/commissions";
import AdminAds from "@/pages/admin/ads";
import AdminSlides from "@/pages/admin/slides";
import AdminContact from "@/pages/admin/contact/index";
import AdminInfoPages from "@/pages/admin/pages/index";
import AdminHomeContent from "@/pages/admin/content/home";
import AdminLabels from "@/pages/admin/content/labels";
import AdminTheme from "@/pages/admin/appearance/theme";
import AdminBranding from "@/pages/admin/appearance/branding";
import AdminDashboardSettings from "@/pages/admin/cms/dashboard-settings";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    if (adminOnly) {
      setLocation("/admin/login");
      return null;
    }
    return <LandingPage />;
  }

  // Check if user account is pending activation (not for admins)
  if ((user as any).status === "pending" && !(user as any).isAdmin) {
    return <PendingAccountPage />;
  }

  if (adminOnly && !(user as any).isAdmin) {
    return <NotFound />;
  }

  return <Component />;
}

function AdminProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetch("/api/admin/session", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setIsLoggedIn(data.isLoggedIn);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      setLocation("/admin/login");
    }
  }, [isLoading, isLoggedIn, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Component />;
}

function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    // Check if user account is pending activation (not for admins)
    if ((user as any).status === "pending" && !(user as any).isAdmin) {
      return <PendingAccountPage />;
    }
    return <Dashboard />;
  }

  return <SplashPage />;
}

function WelcomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    // Check if user account is pending activation (not for admins)
    if ((user as any).status === "pending" && !(user as any).isAdmin) {
      return <PendingAccountPage />;
    }
    return <Dashboard />;
  }

  return <LandingPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/welcome" component={WelcomePage} />
      <Route path="/auth/login">
        {() => <AuthPage defaultMode="login" />}
      </Route>
      <Route path="/auth/register">
        {() => <AuthPage defaultMode="register" />}
      </Route>
      
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/withdraw">
        {() => <ProtectedRoute component={WithdrawPage} />}
      </Route>
      <Route path="/exclusives">
        {() => <ProtectedRoute component={ExclusivesPage} />}
      </Route>
      <Route path="/status">
        {() => <ProtectedRoute component={StatusPage} />}
      </Route>
      <Route path="/withdrawals">
        {() => <ProtectedRoute component={WithdrawPage} />}
      </Route>
      <Route path="/ads-hub">
        {() => <ProtectedRoute component={AdsHubPage} />}
      </Route>
      <Route path="/contact">
        {() => <ProtectedRoute component={ContactPage} />}
      </Route>
      <Route path="/events">
        {() => <ProtectedRoute component={EventsPage} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={SettingsPage} />}
      </Route>

      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin">
        {() => <AdminProtectedRoute component={AdminDashboard} />}
      </Route>
      <Route path="/admin/users">
        {() => <AdminProtectedRoute component={AdminAllUsers} />}
      </Route>
      <Route path="/admin/users/pending">
        {() => <AdminProtectedRoute component={AdminPendingUsers} />}
      </Route>
      <Route path="/admin/users/admins">
        {() => <AdminProtectedRoute component={AdminAdmins} />}
      </Route>
      <Route path="/admin/transactions/users">
        {() => <AdminProtectedRoute component={AdminTransactionUsers} />}
      </Route>
      <Route path="/admin/transactions/premium">
        {() => <AdminProtectedRoute component={AdminPremiumManage} />}
      </Route>
      <Route path="/admin/transactions/premium-plans">
        {() => <AdminProtectedRoute component={AdminPremiumPlans} />}
      </Route>
      <Route path="/admin/transactions/premium-users">
        {() => <AdminProtectedRoute component={AdminPremiumUsers} />}
      </Route>
      <Route path="/admin/transactions/premium-history">
        {() => <AdminProtectedRoute component={AdminPremiumHistory} />}
      </Route>
      <Route path="/admin/transactions/details">
        {() => <AdminProtectedRoute component={AdminTransactionDetails} />}
      </Route>
      <Route path="/admin/withdrawals">
        {() => <AdminProtectedRoute component={AdminWithdrawals} />}
      </Route>
      <Route path="/admin/deposits">
        {() => <AdminProtectedRoute component={AdminDeposits} />}
      </Route>
      <Route path="/admin/commissions">
        {() => <AdminProtectedRoute component={AdminCommissions} />}
      </Route>
      <Route path="/admin/ads">
        {() => <AdminProtectedRoute component={AdminAds} />}
      </Route>
      <Route path="/admin/slides">
        {() => <AdminProtectedRoute component={AdminSlides} />}
      </Route>
      <Route path="/admin/contact/phone">
        {() => <AdminProtectedRoute component={AdminContact} />}
      </Route>
      <Route path="/admin/contact/email">
        {() => <AdminProtectedRoute component={AdminContact} />}
      </Route>
      <Route path="/admin/contact/whatsapp">
        {() => <AdminProtectedRoute component={AdminContact} />}
      </Route>
      <Route path="/admin/contact/telegram">
        {() => <AdminProtectedRoute component={AdminContact} />}
      </Route>
      <Route path="/admin/pages/about">
        {() => <AdminProtectedRoute component={AdminInfoPages} />}
      </Route>
      <Route path="/admin/pages/terms">
        {() => <AdminProtectedRoute component={AdminInfoPages} />}
      </Route>
      <Route path="/admin/pages/privacy">
        {() => <AdminProtectedRoute component={AdminInfoPages} />}
      </Route>
      <Route path="/admin/content/home">
        {() => <AdminProtectedRoute component={AdminHomeContent} />}
      </Route>
      <Route path="/admin/content/dashboard">
        {() => <AdminProtectedRoute component={AdminLabels} />}
      </Route>
      <Route path="/admin/content/labels">
        {() => <AdminProtectedRoute component={AdminLabels} />}
      </Route>
      <Route path="/admin/appearance/theme">
        {() => <AdminProtectedRoute component={AdminTheme} />}
      </Route>
      <Route path="/admin/appearance/branding">
        {() => <AdminProtectedRoute component={AdminBranding} />}
      </Route>
      <Route path="/admin/cms/dashboard">
        {() => <AdminProtectedRoute component={AdminDashboardSettings} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
