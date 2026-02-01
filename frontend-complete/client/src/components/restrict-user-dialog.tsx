import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RestrictUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  onSubmit: (data: { adsLimit: number; deposit: string; commission: string; pendingAmount: string }) => void;
  isPending?: boolean;
  mode?: "create" | "edit";
  defaultValues?: {
    adsLimit?: number;
    deposit?: string;
    commission?: string;
    pendingAmount?: string;
  };
}

export function RestrictUserDialog({ 
  open, 
  onOpenChange, 
  userName, 
  onSubmit,
  isPending,
  mode = "create",
  defaultValues 
}: RestrictUserDialogProps) {
  const [bookingCount, setBookingCount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [pendingAmount, setPendingAmount] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("");

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (open && mode === "edit" && defaultValues) {
      setBookingCount(defaultValues.adsLimit?.toString() || "");
      setDepositAmount(defaultValues.deposit || "");
      setPendingAmount(defaultValues.pendingAmount || "");
      setCommissionAmount(defaultValues.commission || "");
    } else if (open && mode === "create") {
      // Clear form when opening in create mode
      setBookingCount("");
      setDepositAmount("");
      setPendingAmount("");
      setCommissionAmount("");
    }
  }, [open, mode, defaultValues]);

  const handleSubmit = () => {
    if (!bookingCount || !depositAmount || !commissionAmount) {
      return;
    }

    onSubmit({
      adsLimit: parseInt(bookingCount),
      deposit: depositAmount,
      commission: commissionAmount,
      pendingAmount: pendingAmount,
    });

    // Reset form only in create mode
    if (mode === "create") {
      setBookingCount("");
      setDepositAmount("");
      setPendingAmount("");
      setCommissionAmount("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a1628] border-amber-900/20 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-amber-100">
            {mode === "edit" ? "Edit Promotion" : "Create Promotion"}
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-2">
            User: {userName}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Booking Count */}
          <div className="space-y-2">
            <Label htmlFor="booking-count" className="text-amber-100">
              Booking Count
            </Label>
            <Input
              id="booking-count"
              type="number"
              placeholder="Enter ad count limit (e.g., 12)"
              value={bookingCount}
              onChange={(e) => setBookingCount(e.target.value)}
              className="bg-[#1a2840] border-amber-900/30 text-white placeholder:text-muted-foreground"
              data-testid="input-booking-count"
            />
          </div>

          {/* Deposit Amount */}
          <div className="space-y-2">
            <Label htmlFor="deposit-amount" className="text-amber-100">
              Deposit Amount
            </Label>
            <Input
              id="deposit-amount"
              type="number"
              placeholder="Enter deposit amount (e.g., 5000)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="bg-[#1a2840] border-amber-900/30 text-white placeholder:text-muted-foreground"
              data-testid="input-deposit-amount"
            />
          </div>

          {/* Pending Amount */}
          <div className="space-y-2">
            <Label htmlFor="pending-amount" className="text-amber-100">
              Pending Amount
            </Label>
            <Input
              id="pending-amount"
              type="number"
              placeholder="Enter pending amount (e.g., 2000)"
              value={pendingAmount}
              onChange={(e) => setPendingAmount(e.target.value)}
              className="bg-[#1a2840] border-amber-900/30 text-white placeholder:text-muted-foreground"
              data-testid="input-pending-amount"
            />
          </div>

          {/* Commission Amount */}
          <div className="space-y-2">
            <Label htmlFor="commission-amount" className="text-amber-100">
              Commission Amount
            </Label>
            <Input
              id="commission-amount"
              type="number"
              placeholder="Enter commission per ad (e.g., 101.75)"
              value={commissionAmount}
              onChange={(e) => setCommissionAmount(e.target.value)}
              className="bg-[#1a2840] border-amber-900/30 text-white placeholder:text-muted-foreground"
              data-testid="input-commission-amount"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-amber-900/30 text-white hover:bg-amber-900/10"
            data-testid="button-close-dialog"
          >
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !bookingCount || !depositAmount || !commissionAmount}
            className="bg-amber-600 hover:bg-amber-700 text-white"
            data-testid="button-submit-restriction"
          >
            {isPending ? (mode === "edit" ? "Updating..." : "Submitting...") : (mode === "edit" ? "Update Promotion" : "Create Promotion")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
