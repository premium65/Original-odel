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
import AdminDeposits from "@/pages/admin/deposits";
import AdminCommission from "@/pages/admin/commission";
import AdminSocialMedia from "@/pages/admin/social-media";
import AdminAdmins from "@/pages/admin/admins";
import Features from "@/pages/features";
import PointsPage from "@/pages/points";
import WithdrawPage from "@/pages/withdraw";
import WalletPage from "@/pages/wallet";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/rating" component={RatingPage} />
      <Route path="/features" component={Features} />
      <Route path="/withdraw" component={WithdrawPage} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/points" component={PointsPage} />
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
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
      <Route path="/admin/users/:id">
        <AdminLayout>
          <AdminUserDetail />
        </AdminLayout>
      </Route>
      <Route path="/admin/ratings">
        <AdminLayout>
          <AdminRatings />
        </AdminLayout>
      </Route>
      <Route path="/admin/withdrawals">
        <AdminLayout>
          <AdminWithdrawals />
        </AdminLayout>
      </Route>
      <Route path="/admin/ads">
        <AdminLayout>
          <AdminAds />
        </AdminLayout>
      </Route>
      <Route path="/admin/transactions">
        <AdminLayout>
          <AdminTransactions />
        </AdminLayout>
      </Route>
      <Route path="/admin/premium">
        <AdminLayout>
          <AdminPremium />
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
      <Route path="/admin/social-media">
        <AdminLayout>
          <AdminSocialMedia />
        </AdminLayout>
      </Route>
      <Route path="/admin/admins">
        <AdminLayout>
          <AdminAdmins />
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
