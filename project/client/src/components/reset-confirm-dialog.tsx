import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ResetConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName: string;
  fieldName: string;
}

export function ResetConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  userName,
  fieldName,
}: ResetConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-amber-900/20">
        <AlertDialogHeader>
          <AlertDialogTitle>Reset {fieldName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reset <strong>{fieldName}</strong> to 0 for user <strong>{userName}</strong>?
            This action will only reset the ad count, not the financial balances.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-reset">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-amber-600 hover:bg-amber-700"
            data-testid="button-confirm-reset"
          >
            Yes, Reset to 0
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
