import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddValueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldName: string;
  userName: string;
  onSubmit: (amount: string) => void;
  isPending?: boolean;
}

export function AddValueDialog({ 
  open, 
  onOpenChange, 
  fieldName,
  userName,
  onSubmit,
  isPending 
}: AddValueDialogProps) {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (open) {
      setAmount("");
    }
  }, [open]);

  const handleSubmit = () => {
    const value = parseFloat(amount);
    if (!amount || isNaN(value) || value < 0) {
      return;
    }

    // For points, enforce maximum of 100
    if (fieldName === 'points' && value > 100) {
      return;
    }

    onSubmit(amount);
    setAmount("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const maxValue = fieldName === 'points' ? 100 : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a1628] border-amber-900/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-500 text-xl">
            Set {fieldName} for {userName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-300">
              Set Value {maxValue ? `(Max: ${maxValue})` : ''}
            </Label>
            <Input
              id="amount"
              type="number"
              min="0"
              max={maxValue}
              step="1"
              placeholder={maxValue ? `Enter value (0-${maxValue})` : "Enter value"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-[#1a2942] border-amber-900/30 text-white"
              data-testid="input-add-amount"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-amber-900/30 text-gray-300 hover:bg-amber-900/10"
            data-testid="button-cancel-add"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) < 0 || (maxValue && parseFloat(amount) > maxValue) || isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white"
            data-testid="button-confirm-add"
          >
            {isPending ? "Setting..." : "Set"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
