import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface EditUserData {
  username: string;
  mobileNumber: string;
  password?: string;
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: number;
    username: string;
    mobileNumber: string | null;
  };
  onSubmit: (data: EditUserData) => void;
  isPending?: boolean;
}

export function EditUserDialog({ 
  open, 
  onOpenChange, 
  user,
  onSubmit,
  isPending 
}: EditUserDialogProps) {
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) {
      setUsername(user.username);
      setMobileNumber(user.mobileNumber || "");
      setPassword("");
    }
  }, [open, user]);

  const handleSubmit = () => {
    const data: EditUserData = {
      username: username.trim(),
      mobileNumber: mobileNumber.trim(),
    };
    
    if (password.trim()) {
      data.password = password.trim();
    }

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
            Edit User Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-300">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-[#1a2942] border-amber-900/30 text-white"
              data-testid="input-edit-username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-gray-300">
              Mobile Number
            </Label>
            <Input
              id="mobile"
              type="text"
              placeholder="Enter mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-[#1a2942] border-amber-900/30 text-white"
              data-testid="input-edit-mobile"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">
              New Password (optional)
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Leave blank to keep current"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-[#1a2942] border-amber-900/30 text-white"
              data-testid="input-edit-password"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-amber-900/30 text-gray-300 hover:bg-amber-900/10"
            data-testid="button-cancel-edit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!username.trim() || isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white"
            data-testid="button-confirm-edit"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
