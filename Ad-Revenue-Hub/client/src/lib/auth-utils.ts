export function isUnauthorizedError(error: Error): boolean {
  // Covers 401 errors from our local auth APIs
  return error.message.includes("401") || error.message.includes("Unauthorized");
}

// Redirect to local auth page with a toast
export function redirectToLogin(
  toast?: (options: { title: string; description: string; variant: string }) => void
) {
  if (toast) {
    toast({
      title: "Session expired",
      description: "Please log in again.",
      variant: "destructive",
    });
  }

  setTimeout(() => {
    // Local auth page (NOT Replit)
    window.location.href = "/auth";
  }, 500);
}
