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

interface UnrestrictConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName: string;
}

export function UnrestrictConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  userName,
}: UnrestrictConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-amber-900/20">
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Restriction?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove the restriction for <strong>{userName}</strong>?
            This action will clear the restriction settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-unrestrict">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-amber-600 hover:bg-amber-700"
            data-testid="button-confirm-unrestrict"
          >
            Yes, Remove Restriction
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}