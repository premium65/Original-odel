import { useAuth } from "@/hooks/use-auth";
import { useCreateWithdrawal, useWithdrawals } from "@/hooks/use-withdrawals";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWithdrawalSchema } from "@shared/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  ArrowLeft, Wallet, Clock, CheckCircle, XCircle, Lock, CreditCard, History
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

const withdrawalFormSchema = insertWithdrawalSchema.extend({
  amount: z.coerce.number().min(1000, "Minimum withdrawal is 1000 LKR"),
});

export default function WithdrawPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const { mutate: createWithdrawal, isPending } = useCreateWithdrawal();
  const { data: withdrawals, isLoading: isWithdrawalsLoading } = useWithdrawals();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof withdrawalFormSchema>>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      amount: 0,
      method: "Bank Transfer",
      accountDetails: "",
    },
  });

  const onSubmit = (data: z.infer<typeof withdrawalFormSchema>) => {
    createWithdrawal({
      ...data,
      amount: String(data.amount),
    });
    form.reset();
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6">
        <Skeleton className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const userData = user as any || {};
  const balance = Number(userData.milestoneAmount || 0);
  const totalAds = userData.totalAdsCompleted || 0;
  const PAYOUT_UNLOCK_ADS = 28;
  const canWithdraw = totalAds >= PAYOUT_UNLOCK_ADS;
  const adsUntilPayout = Math.max(0, PAYOUT_UNLOCK_ADS - totalAds);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
      case "rejected": return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
      default: return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-xl p-4 mb-6 flex items-center gap-3 shadow-sm"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-orange-500">Payouts</h1>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 border-green-400 bg-white dark:bg-zinc-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Available Balance</h3>
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-green-500">LKR {balance.toFixed(2)}</p>
                  <p className="text-xs text-zinc-500 mt-1">Minimum withdrawal: LKR 1,000.00</p>
                </CardContent>
              </Card>
            </motion.div>

            {!canWithdraw && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="border-2 border-yellow-400 bg-white dark:bg-zinc-900">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Lock className="w-5 h-5 text-yellow-500" />
                      <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Withdrawal Locked</h3>
                    </div>
                    <p className="text-sm text-zinc-500 mb-3">Complete {adsUntilPayout} more ads to unlock withdrawals</p>
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all"
                        style={{ width: `${(totalAds / PAYOUT_UNLOCK_ADS) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">{totalAds} / {PAYOUT_UNLOCK_ADS} ads completed</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {canWithdraw && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white dark:bg-zinc-900">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="w-5 h-5 text-orange-500" />
                      <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Request Withdrawal</h3>
                    </div>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount (LKR)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="1000.00" 
                                  className="bg-zinc-50 dark:bg-zinc-800"
                                  {...field} 
                                  data-testid="input-amount"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="method"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Method</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800" data-testid="select-method">
                                    <SelectValue placeholder="Select method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                  <SelectItem value="EzCash">EzCash</SelectItem>
                                  <SelectItem value="KoKo">KoKo</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="accountDetails"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Details</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Bank Name, Account Number, Branch, Holder Name" 
                                  className="min-h-[80px] bg-zinc-50 dark:bg-zinc-800" 
                                  {...field}
                                  data-testid="input-account-details"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full bg-orange-500 hover:bg-orange-600" 
                          disabled={isPending || balance < 1000}
                          data-testid="button-submit-withdrawal"
                        >
                          {isPending ? "Submitting..." : "Submit Request"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-white dark:bg-zinc-900 h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <History className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 text-lg">Withdrawal History</h3>
                </div>

                {isWithdrawalsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                    ))}
                  </div>
                ) : withdrawals && withdrawals.length > 0 ? (
                  <div className="space-y-3">
                    {withdrawals.map((w, i) => (
                      <motion.div
                        key={w.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4"
                        data-testid={`withdrawal-item-${w.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-zinc-800 dark:text-white">
                            LKR {Number(w.amount).toFixed(2)}
                          </span>
                          <Badge className={`${getStatusColor(w.status || "pending")} flex items-center gap-1`}>
                            {getStatusIcon(w.status || "pending")}
                            <span className="capitalize">{w.status || "pending"}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <span>{w.method}</span>
                          <span>{w.createdAt ? format(new Date(w.createdAt), "MMM d, yyyy") : "-"}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                      <History className="w-8 h-8 text-zinc-400" />
                    </div>
                    <p className="text-zinc-500">No withdrawal history yet</p>
                    <p className="text-xs text-zinc-400 mt-1">Your requests will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
