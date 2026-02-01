import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";
import { ArrowLeft, DollarSign, Building2, CheckCircle2 } from "lucide-react";

export default function WithdrawPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<1 | 2>(1);
  
  // Bank details
  const [fullName, setFullName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  
  // Withdrawal amount
  const [amount, setAmount] = useState("");

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const withdrawalMutation = useMutation({
    mutationFn: async (data: {
      amount: string;
      bankDetails: {
        fullName: string;
        accountNumber: string;
        bankName: string;
        branch: string;
      };
    }) => {
      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to submit withdrawal");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals/my"] });
      
      toast({
        title: "Withdrawal Submitted",
        description: "Your withdrawal request has been submitted for admin approval.",
      });
      
      // Reset form
      setStep(1);
      setFullName("");
      setAccountNumber("");
      setBankName("");
      setBranch("");
      setAmount("");
      
      // Redirect to features page
      setTimeout(() => setLocation('/features'), 1500);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Withdrawal Failed",
        description: error.message || "Failed to submit withdrawal request",
      });
    },
  });

  const handleBankDetailsNext = () => {
    if (!fullName.trim() || !accountNumber.trim() || !bankName.trim() || !branch.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all bank details",
      });
      return;
    }
    
    setStep(2);
  };

  const handleSubmitWithdrawal = () => {
    const withdrawAmount = parseFloat(amount);
    const availableBalance = parseFloat(user?.milestoneAmount || '0');
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
      });
      return;
    }
    
    if (withdrawAmount > availableBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: `You can only withdraw up to LKR ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      });
      return;
    }
    
    withdrawalMutation.mutate({
      amount,
      bankDetails: {
        fullName,
        accountNumber,
        bankName,
        branch,
      },
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const milestoneAmount = parseFloat(user.milestoneAmount || '0');

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 bg-card border rounded-lg p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => step === 1 ? setLocation('/features') : setStep(1)}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold" style={{ color: '#f7931e' }}>
          Withdraw Funds
        </h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div 
            className="flex items-center justify-center h-10 w-10 rounded-full text-white font-semibold"
            style={{ backgroundColor: step === 1 ? '#f7931e' : '#22c55e' }}
          >
            {step === 1 ? '1' : <CheckCircle2 className="h-5 w-5" />}
          </div>
          <span className="text-sm font-medium">Bank Details</span>
        </div>
        
        <div 
          className="h-1 w-16 rounded"
          style={{ backgroundColor: step === 2 ? '#f7931e' : '#666' }}
        />
        
        <div className="flex items-center gap-2">
          <div 
            className="flex items-center justify-center h-10 w-10 rounded-full text-white font-semibold"
            style={{ backgroundColor: step === 2 ? '#f7931e' : '#666' }}
          >
            2
          </div>
          <span className="text-sm font-medium">Withdrawal Amount</span>
        </div>
      </div>

      {/* Step 1: Bank Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6" style={{ color: '#f7931e' }} />
              <CardTitle>Enter Bank Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter account holder's full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                data-testid="input-full-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Enter bank account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                data-testid="input-account-number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="Enter bank name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                data-testid="input-bank-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                placeholder="Enter branch name"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                data-testid="input-branch"
              />
            </div>

            <Button
              className="w-full mt-4"
              style={{ backgroundColor: '#f7931e', color: 'white' }}
              onClick={handleBankDetailsNext}
              data-testid="button-next-step"
            >
              Next: Enter Amount
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Withdrawal Amount */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6" style={{ color: '#f7931e' }} />
              <CardTitle>Enter Withdrawal Amount</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bank Details Summary */}
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold mb-2">Bank Details:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{fullName}</span>
                
                <span className="text-muted-foreground">Account:</span>
                <span className="font-medium">{accountNumber}</span>
                
                <span className="text-muted-foreground">Bank:</span>
                <span className="font-medium">{bankName}</span>
                
                <span className="text-muted-foreground">Branch:</span>
                <span className="font-medium">{branch}</span>
              </div>
            </div>

            {/* Available Balance */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Available Balance:</span>
                <span className="text-2xl font-bold" style={{ color: '#f7931e' }}>
                  LKR {milestoneAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount (LKR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount to withdraw"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-withdrawal-amount"
              />
              <p className="text-xs text-muted-foreground">
                Maximum: LKR {milestoneAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
                data-testid="button-back-to-details"
              >
                Back
              </Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: '#f7931e', color: 'white' }}
                onClick={handleSubmitWithdrawal}
                disabled={withdrawalMutation.isPending}
                data-testid="button-submit-withdrawal"
              >
                {withdrawalMutation.isPending ? "Submitting..." : "Submit Withdrawal"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
