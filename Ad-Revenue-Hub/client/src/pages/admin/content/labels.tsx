import { AdminLayout } from "@/components/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Type, Save, ArrowLeft } from "lucide-react";

export default function AdminLabels() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"]
  });

  const [labels, setLabels] = useState({
    currencySymbol: "LKR",
    balanceLabel: "Total Balance",
    todayEarningsLabel: "Today's Earnings",
    adsWatchedLabel: "Ads Watched",
    pendingLabel: "Pending Amount",
    withdrawButtonText: "Request Withdrawal",
    watchAdButtonText: "Watch to Earn"
  });

  useEffect(() => {
    if (settings) {
      setLabels({
        currencySymbol: settings.currencySymbol || labels.currencySymbol,
        balanceLabel: settings.balanceLabel || labels.balanceLabel,
        todayEarningsLabel: settings.todayEarningsLabel || labels.todayEarningsLabel,
        adsWatchedLabel: settings.adsWatchedLabel || labels.adsWatchedLabel,
        pendingLabel: settings.pendingLabel || labels.pendingLabel,
        withdrawButtonText: settings.withdrawButtonText || labels.withdrawButtonText,
        watchAdButtonText: settings.watchAdButtonText || labels.watchAdButtonText
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/settings/bulk", { settings: labels });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Labels saved" });
    }
  });

  if (!(user as any)?.isAdmin) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  return (
    <AdminLayout>
      <Button 
        variant="ghost" 
        onClick={() => window.history.back()}
        className="text-zinc-400 hover:text-white mb-4"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <Type className="h-6 w-6 text-violet-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Text & Labels</h1>
          <p className="text-muted-foreground">Customize button text and labels across the site</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dashboard Labels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Currency Symbol</Label>
              <Input
                value={labels.currencySymbol}
                onChange={(e) => setLabels({...labels, currencySymbol: e.target.value})}
                placeholder="LKR"
                data-testid="input-currency-symbol"
              />
            </div>
            <div>
              <Label>Balance Label</Label>
              <Input
                value={labels.balanceLabel}
                onChange={(e) => setLabels({...labels, balanceLabel: e.target.value})}
                placeholder="Total Balance"
                data-testid="input-balance-label"
              />
            </div>
            <div>
              <Label>Today's Earnings Label</Label>
              <Input
                value={labels.todayEarningsLabel}
                onChange={(e) => setLabels({...labels, todayEarningsLabel: e.target.value})}
                placeholder="Today's Earnings"
                data-testid="input-today-earnings-label"
              />
            </div>
            <div>
              <Label>Ads Watched Label</Label>
              <Input
                value={labels.adsWatchedLabel}
                onChange={(e) => setLabels({...labels, adsWatchedLabel: e.target.value})}
                placeholder="Ads Watched"
                data-testid="input-ads-watched-label"
              />
            </div>
            <div>
              <Label>Pending Amount Label</Label>
              <Input
                value={labels.pendingLabel}
                onChange={(e) => setLabels({...labels, pendingLabel: e.target.value})}
                placeholder="Pending Amount"
                data-testid="input-pending-label"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Button Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Withdraw Button Text</Label>
              <Input
                value={labels.withdrawButtonText}
                onChange={(e) => setLabels({...labels, withdrawButtonText: e.target.value})}
                placeholder="Request Withdrawal"
                data-testid="input-withdraw-button-text"
              />
            </div>
            <div>
              <Label>Watch Ad Button Text</Label>
              <Input
                value={labels.watchAdButtonText}
                onChange={(e) => setLabels({...labels, watchAdButtonText: e.target.value})}
                placeholder="Watch to Earn"
                data-testid="input-watch-ad-button-text"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full mt-6"
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        data-testid="button-save-labels"
      >
        <Save className="mr-2 h-4 w-4" />
        Save Labels
      </Button>
    </AdminLayout>
  );
}
