import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface EditBankData {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branchName: string;
}

interface EditBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: number;
    username: string;
    bankName: string | null;
    accountNumber: string | null;
    accountHolderName: string | null;
    branchName: string | null;
  };
  onSubmit: (data: EditBankData) => void;
  isPending?: boolean;
}

export function EditBankDialog({ 
  open, 
  onOpenChange, 
  user,
  onSubmit,
  isPending 
}: EditBankDialogProps) {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [branchName, setBranchName] = useState("");

  useEffect(() => {
    if (open) {
      setBankName(user.bankName || "");
      setAccountNumber(user.accountNumber || "");
      setAccountHolderName(user.accountHolderName || "");
      setBranchName(user.branchName || "");
    }
  }, [open, user]);

  const handleSubmit = () => {
    const data: EditBankData = {
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolderName: accountHolderName.trim(),
      branchName: branchName.trim(),
    };

    onSubmit(data);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a1628] border-amber-900/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-500 text-xl">
            Edit Bank Details - {user.username}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bankName" className="text-gray-300">
              Bank Name
            </Label>
            <Input
              id="bankName"
              type="text"
              placeholder="Enter bank name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-[#1a2942] border-amber-900/30 text-white"
              data-testid="input-edit-bank-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="text-gray-300">
              Account Number
            </Label>
            <Input
              id="accountNumber"
              type="text"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-[#1a2942] border-amber-900/30 text-white"
              data-testid="input-edit-account-number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolderName" className="text-gray-300">
              Account Holder Name
            </Label>
            <Input
              id="accountHolderName"
              type="text"
              placeholder="Enter account holder name"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-[#1a2942] border-amber-900/30 text-white"
              data-testid="input-edit-account-holder"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branchName" className="text-gray-300">
              Branch Name
            </Label>
            <Input
              id="branchName"
              type="text"
              placeholder="Enter branch name"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-[#1a2942] border-amber-900/30 text-white"
              data-testid="input-edit-branch"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-amber-900/30 text-gray-300 hover:bg-amber-900/10"
            data-testid="button-cancel-bank-edit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white"
            data-testid="button-confirm-bank-edit"
          >
            {isPending ? "Saving..." : "Save Bank Details"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
