import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Register from "@/pages/register";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import RatingPage from "@/pages/rating";
import AdminLayout from "@/pages/admin/layout";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminPending from "@/pages/admin/pending";
import AdminUserDetail from "@/pages/admin/user-detail";
import AdminRatings from "@/pages/admin/ratings";
import AdminWithdrawals from "@/pages/admin/withdrawals";
import AdminAds from "@/pages/admin/ads";
import AdminTransactions from "@/pages/admin/transactions";
import AdminPremium from "@/pages/admin/premium";
import AdminPremiumManage from "@/pages/admin/premium-manage";
import AdminDeposits from "@/pages/admin/deposits";
import AdminCommission from "@/pages/admin/commission";
import AdminAdmins from "@/pages/admin/admins";
import AdminSlideshow from "@/pages/admin/admin-slideshow";
import AdminThemeSettings from "@/pages/admin/admin-theme-settings";
// NEW PAGES
import AdminTransactionUsers from "@/pages/admin/transaction-users";
import AdminContactPhone from "@/pages/admin/contact-phone";
import AdminContactEmail from "@/pages/admin/contact-email";
import AdminContactWhatsapp from "@/pages/admin/contact-whatsapp";
import AdminContactTelegram from "@/pages/admin/contact-telegram";
import AdminInfoAbout from "@/pages/admin/info-about";
import AdminInfoTerms from "@/pages/admin/info-terms";
import AdminInfoPrivacy from "@/pages/admin/info-privacy";
import AdminContentHome from "@/pages/admin/content-home";
import AdminContentDashboard from "@/pages/admin/content-dashboard";
import AdminContentText from "@/pages/admin/content-text";
import AdminBranding from "@/pages/admin/branding";
import Features from "@/pages/features";
import PointsPage from "@/pages/points";
import WithdrawPage from "@/pages/withdraw";
import WalletPage from "@/pages/wallet";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/rating" component={RatingPage} />
      <Route path="/features" component={Features} />
      <Route path="/withdraw" component={WithdrawPage} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/points" component={PointsPage} />

      {/* Admin Dashboard */}
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>

      {/* USER MANAGEMENT */}
      <Route path="/admin/users">
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      </Route>
      <Route path="/admin/pending">
        <AdminLayout>
          <AdminPending />
        </AdminLayout>
      </Route>
      <Route path="/admin/admins">
        <AdminLayout>
          <AdminAdmins />
        </AdminLayout>
      </Route>
      <Route path="/admin/users/:id">
        <AdminLayout>
          <AdminUserDetail />
        </AdminLayout>
      </Route>

      {/* TRANSACTION */}
      <Route path="/admin/transaction-users">
        <AdminLayout>
          <AdminTransactionUsers />
        </AdminLayout>
      </Route>
      <Route path="/admin/premium-manage">
        <AdminLayout>
          <AdminPremiumManage />
        </AdminLayout>
      </Route>
      <Route path="/admin/premium">
        <AdminLayout>
          <AdminPremium />
        </AdminLayout>
      </Route>
      <Route path="/admin/transactions">
        <AdminLayout>
          <AdminTransactions />
        </AdminLayout>
      </Route>
      <Route path="/admin/withdrawals">
        <AdminLayout>
          <AdminWithdrawals />
        </AdminLayout>
      </Route>
      <Route path="/admin/deposits">
        <AdminLayout>
          <AdminDeposits />
        </AdminLayout>
      </Route>
      <Route path="/admin/commission">
        <AdminLayout>
          <AdminCommission />
        </AdminLayout>
      </Route>

      {/* ADS MANAGEMENT */}
      <Route path="/admin/ads">
        <AdminLayout>
          <AdminAds />
        </AdminLayout>
      </Route>
      <Route path="/admin/ratings">
        <AdminLayout>
          <AdminRatings />
        </AdminLayout>
      </Route>

      {/* SOCIAL MEDIA - Contact Us */}
      <Route path="/admin/contact/phone">
        <AdminLayout>
          <AdminContactPhone />
        </AdminLayout>
      </Route>
      <Route path="/admin/contact/email">
        <AdminLayout>
          <AdminContactEmail />
        </AdminLayout>
      </Route>
      <Route path="/admin/contact/whatsapp">
        <AdminLayout>
          <AdminContactWhatsapp />
        </AdminLayout>
      </Route>
      <Route path="/admin/contact/telegram">
        <AdminLayout>
          <AdminContactTelegram />
        </AdminLayout>
      </Route>

      {/* SOCIAL MEDIA - Info */}
      <Route path="/admin/info/about">
        <AdminLayout>
          <AdminInfoAbout />
        </AdminLayout>
      </Route>
      <Route path="/admin/info/terms">
        <AdminLayout>
          <AdminInfoTerms />
        </AdminLayout>
      </Route>
      <Route path="/admin/info/privacy">
        <AdminLayout>
          <AdminInfoPrivacy />
        </AdminLayout>
      </Route>

      {/* SITE CONTENT */}
      <Route path="/admin/content/home">
        <AdminLayout>
          <AdminContentHome />
        </AdminLayout>
      </Route>
      <Route path="/admin/content/dashboard">
        <AdminLayout>
          <AdminContentDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/slideshow">
        <AdminLayout>
          <AdminSlideshow />
        </AdminLayout>
      </Route>
      <Route path="/admin/content/text">
        <AdminLayout>
          <AdminContentText />
        </AdminLayout>
      </Route>

      {/* APPEARANCE */}
      <Route path="/admin/theme-settings">
        <AdminLayout>
          <AdminThemeSettings />
        </AdminLayout>
      </Route>
      <Route path="/admin/branding">
        <AdminLayout>
          <AdminBranding />
        </AdminLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
